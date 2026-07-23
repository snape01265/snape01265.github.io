using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Reflection.Emit;
using LmgLib;
using LmgLib.Unity;
using UnityEditor;
using UnityEditor.Experimental.GraphView;
using UnityEngine;
using UnityEngine.UIElements;
using static LmgLib.Unity.LSolidEditor;

namespace Puppy
{
	public class BaristaGraphView : GraphView
	{
		public new class UxmlFactory : UxmlFactory<BaristaGraphView, GraphView.UxmlTraits> { }

		const string GraphStylePath = "Assets/Misc/BaristaGraphStyles/BaristaGraphViewStyles.uss";
		const float minZoomScale = 0.1f;
		const float maxZoomScale = 3f;

		public Action<BaristaNodeEditor> OnNodeSelected;
		public Action<BaristaNodeEditor> OnNodeDeselected;

		EditorSavedProperty<BaristaGraphData> mProperty;
		BaristaGraphData mData;
		BaristaGraphEditor mWindow;

		List<BaristaNodeEditor> mEditorNodes;
		Dictionary<string, BaristaNodeEditor> mNodeDictionary;
		Dictionary<Edge, BaristaGraphConnection> mConnectionDictionary;
		Dictionary<BaristaGroup, BaristaGroupEditor> mGroupDictionary;

		static List<BaristaNodeEditor> CopyNodes;
		static List<BaristaGraphConnection> CopyConnections;
		static LVector2 LastMousePos;
		static Dictionary<string, string> PasteNodesIDMap;

		public BaristaGraphEditor WindowBase => mWindow;
		public BaristaGraphData Data => mData;

		public void Init(EditorSavedProperty<BaristaGraphData> property, BaristaGraphEditor editorWindow, BaristaGraphData data)
		{
			mWindow = editorWindow;
			mProperty = property;
			mData = data;

			if( CopyNodes == null)
				CopyNodes = new List<BaristaNodeEditor>();

			if( CopyConnections == null)
				CopyConnections = new List<BaristaGraphConnection>();

			if( PasteNodesIDMap == null )
				PasteNodesIDMap = new Dictionary<string, string>();

			mEditorNodes = new List<BaristaNodeEditor>();
			mNodeDictionary = new Dictionary<string, BaristaNodeEditor>();
			mConnectionDictionary = new Dictionary<Edge, BaristaGraphConnection>();
			mGroupDictionary = new Dictionary<BaristaGroup, BaristaGroupEditor>();

			RegisterCallback<MouseMoveEvent>(OnMouseMove);
			RegisterCallback<MouseDownEvent>(OnMouseDown);
			nodeCreationRequest = ShowSearchWindow;
			graphViewChanged += OnGraphViewChanged;
			serializeGraphElements += CopyGraphElements;
			canPasteSerializedData += AllowPaste;
			unserializeAndPaste += PasteGraphElements;

			AddGridBackground();
			AddStyles();
			AddManipulators();
			DrawNodes();
			DrawConnections();
			DrawGroups();
		}

		void AddGridBackground()
		{
			GridBackground grid = new GridBackground();
			grid.StretchToParentSize();
			Insert(0, grid);
		}

		void AddStyles()
		{
			StyleSheet graphViewStyle = AssetDatabase.LoadAssetAtPath<StyleSheet>(GraphStylePath);
			styleSheets.Add(graphViewStyle);
		}

		void AddManipulators()
		{
			ContentZoomer contentZoomer = new ContentZoomer();
			contentZoomer.minScale = minZoomScale;
			contentZoomer.maxScale = maxZoomScale;
			this.AddManipulator(contentZoomer);
			this.AddManipulator(new ContentDragger());
			this.AddManipulator(new SelectionDragger());
			this.AddManipulator(new RectangleSelector());
			this.AddManipulator(CreateGroupContextualMenu());
		}

		IManipulator CreateGroupContextualMenu()
		{
			ContextualMenuManipulator manipulator = new ContextualMenuManipulator(
				menuEvent => menuEvent.menu.AppendAction("Create Group", actionEvent => CreateGroup("BaristaGroup", LastMousePos))
			);
			return manipulator;
		}

		public override List<Port> GetCompatiblePorts(Port startPort, NodeAdapter nodeAdapter)
		{
			List<Port> allPorts = new List<Port>();
			List<Port> ports = new List<Port>();

			foreach( var node in mEditorNodes )
			{
				allPorts.AddRange(node.Ports);
			}

			foreach( Port port in allPorts )
			{
				if( port == startPort ) { continue; }
				if( port.node == startPort.node ) { continue; }
				if( port.direction == startPort.direction ) { continue; }

				if( port.portType == startPort.portType )
				{
					ports.Add(port);
				}
			}

			return ports;
		}

		GraphViewChange OnGraphViewChanged(GraphViewChange graphViewChange)
		{
			if( graphViewChange.movedElements != null )
			{
				if( mProperty.mTarget != null )
					Undo.RecordObject(mProperty.mTarget, "Moved Elements");

				foreach( BaristaNodeEditor node in graphViewChange.movedElements.OfType<BaristaNodeEditor>() )
				{
					mData.GetNode(node.Node.Property.ID).SetPosition(node.GetPosition());
					Apply();
				}

				foreach( BaristaGroupEditor group in graphViewChange.movedElements.OfType<BaristaGroupEditor>() )
				{
					BaristaGroup data = mData.GetGroup(group.ID);
					data.SetPosition(group.GetPosition());

					if( data.Nodes == null ) { continue; }

					foreach( string nodeID in data.Nodes )
					{
						mData.GetNode(nodeID).SetPosition(mNodeDictionary[nodeID].GetPosition());
					}
					Apply();
				}
			}

			if( graphViewChange.elementsToRemove != null )
			{
				if( mProperty.mTarget != null )
					Undo.RecordObject(mProperty.mTarget, "Removed Graph Object");

				List<BaristaNodeEditor> nodesRemoved = graphViewChange.elementsToRemove.OfType<BaristaNodeEditor>().ToList();

				if( nodesRemoved.Count > 0 )
				{
					for( int i = nodesRemoved.Count - 1; i >= 0; i-- )
					{
						RemoveNode(nodesRemoved[i]);
					}
				}

				foreach( Edge edge in graphViewChange.elementsToRemove.OfType<Edge>() )
				{
					RemoveConnection(edge);
				}

				foreach( BaristaGroupEditor group in graphViewChange.elementsToRemove.OfType<BaristaGroupEditor>() )
				{
					RemoveGroup(group);
				}
			}

			if( graphViewChange.edgesToCreate != null )
			{
				if( mProperty.mTarget != null )
					Undo.RecordObject(mProperty.mTarget, "Added Connections");

				foreach( Edge edge in graphViewChange.edgesToCreate )
				{
					CreateEdge(edge);
				}
			}

			return graphViewChange;
		}

		#region MouseEvent
		void OnMouseMove(MouseMoveEvent evt)
		{
			LastMousePos = contentViewContainer.WorldToLocal(evt.mousePosition);
		}

		void OnMouseDown(MouseDownEvent evt)
		{
			if( evt.button == 0 )
			{
				AutoCompleteDropDownHide();  // 이거 말고는 모르겠다...
			}
		}
		#endregion

		#region Copy & Paste
		string CopyGraphElements(IEnumerable<GraphElement> elements)
		{
			CopyNodes = elements.OfType<BaristaNodeEditor>().ToList();
			CopyNodes.RemoveWhere(node => node.Node.ActionType == "Start");
			List<Edge> copyEdges = elements.OfType<Edge>().ToList();

			foreach( Edge edge in copyEdges )
			{
				mConnectionDictionary.TryGetValue(edge, out BaristaGraphConnection connection);
				CopyConnections.Add(connection);
			}

			return "";
		}

		void PasteGraphElements(string operationName, string data)
		{
			PasteNodes();
			PasteConnections();
		}

		// 노드 원점이 왼쪽 위다. 그래서 노드의 크기의 반만큼 빼줘야 한다.
		LVector2 NodeHalfDim = new LVector2(71, 41);

		void PasteNodes()
		{
			PasteNodesIDMap.Clear();

			if( CopyNodes.Count == 1 )
			{
				BaristaNode newNode = CopyNode(CopyNodes[0].Node, LastMousePos - NodeHalfDim);
				AddNode(newNode);
			}
			else if( CopyNodes.Count > 1 )
			{
				List<LVector2> offsets = GetOffsetFromCenter(CopyNodes);
				for( int i = 0; i < CopyNodes.Count; i++ )
				{
					BaristaNode newNode = CopyNode(CopyNodes[i].Node, LastMousePos + offsets[i] - NodeHalfDim);
					PasteNodesIDMap.Add(CopyNodes[i].Node.Property.ID, newNode.Property.ID);
					AddNode(newNode);
				}
			}
		}

		BaristaNode CopyNode(BaristaNode original, LVector2 pastePos)
		{
			BaristaNode copy = new BaristaNode();
			copy.CopyData(original);
			copy.SetPosition(pastePos);
			return copy;
		}

		List<LVector2> GetOffsetFromCenter(List<BaristaNodeEditor> nodes)
		{
			float minX = float.MaxValue;
			float minY = float.MaxValue;
			float maxX = float.MinValue;
			float maxY = float.MinValue;

			foreach( BaristaNodeEditor node in nodes )
			{
				minX = LMath.Min(minX, node.GetPosition().x);
				minY = LMath.Min(minY, node.GetPosition().y);
				maxX = LMath.Max(maxX, node.GetPosition().x);
				maxY = LMath.Max(maxY, node.GetPosition().y);
			}

			LVector2 centerPos = new LVector2((minX + maxX) * 0.5f, (minY + maxY) * 0.5f);

			List<LVector2> offsets = new List<LVector2>();
			foreach( BaristaNodeEditor node in nodes )
			{
				LVector2 offset = (LVector2)node.GetPosition().position - centerPos;
				offsets.Add(offset);
			}
			return offsets;
		}

		void PasteConnections()
		{
			if( CopyConnections.Count <= 0 || PasteNodesIDMap.Count <= 0 )
				return;

			foreach( BaristaGraphConnection connection in CopyConnections )
			{
				bool hasOutput = PasteNodesIDMap.TryGetValue(connection.OutputPort.NodeID, out string copyOutputID);
				bool hasInput = PasteNodesIDMap.TryGetValue(connection.InputPort.NodeID, out string copyInputID);

				if( !hasInput || !hasOutput )
					continue;

				BaristaGraphConnection copyConnection = new BaristaGraphConnection(copyInputID, connection.InputPort.PortIndex, copyOutputID, connection.OutputPort.PortIndex);
				AddConnectionToGraph(copyConnection);
				mData.Connections.Add(copyConnection);
			}
			Apply();
		}

		bool AllowPaste(string data)
		{
			return true;
		}

		public void HandleRecipeViewGUI()
		{
			GUIStyle style = new GUIStyle(GUI.skin.button);
			style.fontSize = 20;

			if( Button(ImgText(LSolidEditor.Resources.DiskIcon, " 레시피 저장하기"), 0, 40, style) )
			{
				SaveBaristaRecipe();
			}

			if( Button(ImgText(LSolidEditor.Resources.FolderIcon, " 레시피 불러오기"), 0, 40, style) )
			{
				LoadBaristaRecipe();
			}
		}

		void SaveBaristaRecipe()
		{
			List<BaristaNode> nodes = new List<BaristaNode>();
			Dictionary<string, string> copyNodeDic = new Dictionary<string, string>();
			List<BaristaGraphConnection> connections = new List<BaristaGraphConnection>();
			List<Edge> edges = new List<Edge>();
			List<BaristaGroup> groups = new List<BaristaGroup>();

			foreach( GraphElement selectedElement in selection )
			{
				if( selectedElement is BaristaNodeEditor node )
				{
					if( node.Node.ActionType == "Start" )
						continue;

					BaristaNode copyNode = new BaristaNode();
					copyNode.CopyData(node.Node);
					copyNode.SetPosition(node.Node.Property.Pos);
					copyNodeDic.Add(node.Node.Property.ID, copyNode.Property.ID);
					nodes.Add(copyNode);
				}
				else if( selectedElement is Edge edge )
				{
					edges.Add(edge);
				}
			}

			foreach( GraphElement selectedElement in selection)
			{
				if( selectedElement is BaristaGroupEditor group )
				{
					BaristaGroup data = mData.GetGroup(group.ID);
					if( data == null )
						continue;

					BaristaGroup copyData = new BaristaGroup(data.GroupTitle, data.GroupPos);
					foreach( string nodeID in data.Nodes )
					{
						if( copyNodeDic.ContainsKey(nodeID) )
						{
							copyData.AddNode(copyNodeDic[nodeID]);
						}
					}

					groups.Add(copyData);
				}
			}

			foreach( Edge edge in edges )
			{
				bool hasConnection = mConnectionDictionary.TryGetValue(edge, out BaristaGraphConnection connection);

				if( !hasConnection )
					continue;

				bool hasInput = mNodeDictionary.ContainsKey(connection.InputPort.NodeID);
				bool hasOutput = mNodeDictionary.ContainsKey(connection.OutputPort.NodeID);

				if( !hasInput || !hasOutput )
					continue;

				BaristaNode inputNode = mNodeDictionary[connection.InputPort.NodeID].Node;
				BaristaNode outputNode = mNodeDictionary[connection.OutputPort.NodeID].Node;

				bool hasInputNode = copyNodeDic.ContainsKey(inputNode.Property.ID);
				bool hasOutputNode = copyNodeDic.ContainsKey(outputNode.Property.ID);

				if( !hasInputNode || !hasOutputNode )
					continue;

				BaristaGraphConnection copyConnection = new BaristaGraphConnection(copyNodeDic[inputNode.Property.ID], connection.InputPort.PortIndex, 
																				   copyNodeDic[outputNode.Property.ID], connection.OutputPort.PortIndex);
				connections.Add(copyConnection);
			}

			BaristaRecipeSaveEditor.OpenRecipeEditor(nodes, connections, groups);
		}

		void LoadBaristaRecipe()
		{
			BaristaRecipeLoadEditor.OpenRecipeEditor(this);
		}

		public void LoadRecipe(BaristaRecipe recipe)
		{
			Rect viewportRect = contentViewContainer.layout;
			Vector2 center = viewportRect.center;

			Dictionary<string, string> IDPairs = new Dictionary<string, string>();
			List<ISelectable> newSelection = new List<ISelectable>();

			foreach( BaristaNode node in recipe.NodeList )   // 새로운 노드를 생성(GUID, Pos는 복사하지 않으니까 새로 만들어준다)
			{
				BaristaNode newNode = new BaristaNode();
				newNode.CopyData(node);
				newNode.SetPosition(node.Property.Pos);
				IDPairs.Add(node.Property.ID, newNode.Property.ID);
				AddNode(newNode);

				newSelection.Add(mNodeDictionary[newNode.Property.ID]);
			}

			foreach( BaristaGraphConnection connection in recipe.ConnectionList )  // 새로운 커넥션을 생성(노드들 ID가 바뀌었으니 새로 만들어준다)
			{
				string newInputID = IDPairs[connection.InputPort.NodeID];
				string newOutputID = IDPairs[connection.OutputPort.NodeID];
				BaristaGraphConnection newConnection = new BaristaGraphConnection(newInputID, connection.InputPort.PortIndex, newOutputID, connection.OutputPort.PortIndex);
				AddConnectionToGraph(newConnection);
				mData.Connections.Add(newConnection);
				
				newSelection.Add(mConnectionDictionary.FirstOrDefault(c => c.Value == newConnection).Key);
			}

			foreach( BaristaGroup group in recipe.GroupList )  // 새로운 그룹을 생성(GUID, Pos는 복사하지 않고 노드들 ID가 바뀌었으니 새로 만들어준다)
			{
				BaristaGroup newGroupData = new BaristaGroup(group.GroupTitle, group.GroupPos);
				foreach( string nodeID in group.Nodes )
				{
					string newNodeID = IDPairs[nodeID];
					newGroupData.AddNode(newNodeID);
				}
				AddGroupToGraph(newGroupData);
				mData.AddGroup(newGroupData);

				newSelection.Add(mGroupDictionary[newGroupData]);
			}

			ClearSelection();

			foreach( ISelectable selectable in newSelection )  // 새로 생성한 Element들을 선택한다.
			{
				AddToSelection(selectable);
			}
			Apply();
		}

		#endregion

		#region Add & Remove Elements
		public void RedrawGraph(BaristaGraphData updateData)
		{
			mEditorNodes.Clear();
			mNodeDictionary.Clear();
			mConnectionDictionary.Clear();
			mGroupDictionary.Clear();
			DeleteElements(graphElements.ToList());
			mData = updateData;

			DrawNodes();
			DrawConnections();
			DrawGroups();
		}

		void CreateEdge(Edge edge)
		{
			BaristaNodeEditor inputNode = (BaristaNodeEditor)edge.input.node;
			BaristaNodeEditor outputNode = (BaristaNodeEditor)edge.output.node;
			int inputIndex = inputNode.Ports.IndexOf(edge.input);
			int outputIndex = outputNode.Ports.IndexOf(edge.output);

			BaristaGraphConnection connection = new BaristaGraphConnection(inputNode.Node.Property.ID, inputIndex, outputNode.Node.Property.ID, outputIndex);
			mConnectionDictionary.Add(edge, connection);
			mData.Connections.Add(connection);
			Apply();
		}

		void RemoveNode(BaristaNodeEditor editorNode)
		{
			if( mNodeDictionary.TryGetValue(editorNode.Node.Property.ID, out BaristaNodeEditor node) )
			{
				mNodeDictionary.Remove(editorNode.Node.Property.ID);
				mEditorNodes.Remove(editorNode);
				foreach( BaristaGroup group in mData.Groups )
				{
					if( group.HasNode(node.Node.Property.ID) )
					{
						mData.RemoveNodeFromGroup(group.GroupID, node.Node.Property.ID);
					}
				}
				mData.RemoveNode(node.Node.Property.ID);
			}
			Apply();
		}

		void RemoveConnection(Edge edge)
		{
			if( mConnectionDictionary.TryGetValue(edge, out BaristaGraphConnection connection) )
			{
				mData.Connections.Remove(connection);
				mConnectionDictionary.Remove(edge);
			}
			Apply();
		}

		void RemoveGroup(BaristaGroupEditor group)
		{
			BaristaGroup groupData = mGroupDictionary.FirstOrDefault(g => g.Value == group).Key;
			if( groupData != default )
			{
				mGroupDictionary.Remove(groupData);
				mData.RemoveGroup(groupData.GroupID);
			}
			Apply();
		}

		void DrawNodes()
		{
			if( mData.Nodes.Count == 0 ) { return; }

			foreach( BaristaNode node in mData.Nodes )
			{
				AddNodeToGraph(node);
			}
			//Apply();
		}

		void DrawConnections()
		{
			if( mData.Connections.Count == 0 ) { return; }

			foreach( BaristaGraphConnection connection in mData.Connections )
			{
				AddConnectionToGraph(connection);
			}
			//Apply();
		}

		void DrawGroups()
		{
			if( mData.Groups.Count == 0 ) { return; }

			foreach( BaristaGroup groupData in mData.Groups )
			{
				AddGroupToGraph(groupData);
			}
			//Apply();
		}

		public void AddNode(BaristaNode node)
		{
			if( mProperty.mTarget != null )
				Undo.RecordObject(mProperty.mTarget, "Add Node");

			mData.AddNode(node);
			AddNodeToGraph(node);
			Apply();
		}

		void AddNodeToGraph(BaristaNode node)
		{
			BaristaNodeEditor editorNode = new BaristaNodeEditor(node);
			editorNode.SetNodeEditorBase(CreateActionEditor(node));
			editorNode.SetPosition(node.Property.Pos);
			editorNode.OnNodeSelected = OnNodeSelected;
			editorNode.OnNodeDeselected = OnNodeDeselected;

			mEditorNodes.Add(editorNode);
			mNodeDictionary.Add(node.Property.ID, editorNode);
			AddElement(editorNode);
		}

		void AddConnectionToGraph(BaristaGraphConnection connection)
		{
			BaristaNodeEditor inputNode = GetNode(connection.InputPort.NodeID);
			BaristaNodeEditor outputNode = GetNode(connection.OutputPort.NodeID);

			if( inputNode == null || outputNode == null ) { return; }

			Port inputPort = inputNode.Ports.Single(port => port.direction == Direction.Input);
			Port outputPort = outputNode.Ports.Single(port => port.direction == Direction.Output);

			Edge edge = inputPort.ConnectTo(outputPort);
			AddElement(edge);

			mConnectionDictionary.Add(edge, connection);

			BaristaNodeEditor GetNode(string nodeID)
			{
				BaristaNodeEditor node;
				mNodeDictionary.TryGetValue(nodeID, out node);
				return node;
			}
		}

		void AddGroupToGraph(BaristaGroup groupData)
		{
			if( mProperty.mTarget != null )
				Undo.RecordObject(mProperty.mTarget, "Add Group");

			BaristaGroupEditor group = new BaristaGroupEditor(groupData, this);

			AddElement(group);

			foreach( string nodeID in groupData.Nodes )
			{
				if( mNodeDictionary.TryGetValue(nodeID, out BaristaNodeEditor node) )
				{
					group.AddElement(node);
				}
			}
			mGroupDictionary.Add(groupData, group);
		}

		BaristaNodeEditorBase CreateActionEditor(BaristaNode taskData)
		{
			string actionType = taskData.ActionType;
			if( actionType.IsValid() )
			{
				Type type = BaristaActionFactory.GetTypeForAction(actionType);
				if( type != null )
				{
					Type editorType = BaristaEditorNodeStatic.GetOrCreateEditorType(type);
					if( editorType != null )
					{
						BaristaNodeEditorBase editorInst = (BaristaNodeEditorBase)ScriptableObject.CreateInstance(editorType);

						if( taskData.JsonData.IsValid() )
							editorInst.SetJson(taskData.JsonData);
						else
							editorInst.SetDefault(taskData);

						// OnCreate에서 serialized-object를 생성하기 때문에 SetJson보다 나중에 호출해야 한다.
						editorInst.OnCreate();
						editorInst.CreateSO();

						editorInst.mParent = mWindow;
						editorInst.mNodeData = taskData;

						return editorInst;
					}
				}
			}

			return null;
		}

		public BaristaGroupEditor CreateGroup(string title, LVector2 localMousePos)
		{
			BaristaGroupEditor group = new BaristaGroupEditor(title, localMousePos, this);

			if( group.ID.IsEmpty() )
				return null;

			AddElement(group);
			mData.CreateNewGroup(group.ID, group.Title, group.GetPosition().position);

			foreach( GraphElement selectedElement in selection )
			{
				if( selectedElement is not BaristaNodeEditor)
				{
					continue;
				}

				BaristaNodeEditor node = (BaristaNodeEditor)selectedElement;
				group.AddElement(node);
				mData.AddNodeToGroup(group.ID, node.Node.Property.ID);
			}
			mGroupDictionary.Add(mData.GetGroup(group.ID), group);
			Apply();

			return group;
		}
		#endregion

		#region SearchWindow
		void ShowSearchWindow(NodeCreationContext obj)
		{
			string[] actionList = BaristaGraphEditor.ActionEnumHelper.MenuPaths;
			BaristaGraphSearchProvider searchProvider = new BaristaGraphSearchProvider(this, actionList);
			SearchWindow.Open(new SearchWindowContext(obj.screenMousePosition, 400, 56 + BaristaGraphEditor.ActionEnumHelper.PathCount * 20), searchProvider);
		}
		#endregion

		#region Miscellaneous
		public void ChangeNode(BaristaNode originalNode, string menuName)
		{
			string menuPath = BaristaGraphEditorHelper.ActionMenuPathFromType(BaristaGraphEditorHelper.ActionTypeFromMenuName(menuName));
			string oldPath = originalNode.MenuPath;

			originalNode.MenuPath = menuPath;
			originalNode.Desc = "";
			originalNode.StartDelay = 0;
			originalNode.ActionType = BaristaGraphEditorHelper.ActionNameFromMenuName(menuName);
			originalNode.JsonData = "";
			originalNode.CheckPointCondition = "";

			mNodeDictionary.TryGetValue(originalNode.Property.ID, out BaristaNodeEditor editorNode);
			mEditorNodes.Remove(editorNode);
			mNodeDictionary.Remove(originalNode.Property.ID);
			RemoveElement(editorNode);

			editorNode.UpdateEditorNode(oldPath);
			editorNode.SetNodeEditorBase(CreateActionEditor(originalNode));

			mEditorNodes.Add(editorNode);
			mNodeDictionary.Add(originalNode.Property.ID, editorNode);
			AddElement(editorNode);

			Apply();
		}

		public void UpdateNodeState()
		{
			if( Application.isPlaying )
			{
				mProperty.Update();
				BaristaGraphData newData = mProperty.mData;
				if( mData != newData )
				{
					mData = newData;
					mData.Init();
				}

				mEditorNodes.ForEach(node =>
				{
					BaristaNode curNode = mData.GetNode(node.Node.Property.ID);
					node.UpdateState(curNode);
				});
			}
		}

		public void Bind()
		{
			Apply();
		}

		void Apply()
		{
			mProperty.Update();
			mProperty.mData = mData;
			mProperty.Apply();
		}
		#endregion

		public void CleanUpEditors()
		{
			foreach( BaristaNodeEditor node in mEditorNodes )
			{
				node.NodeEditorBase.OnClose();
			}
		}
	}

	//==========================================================
	// BaristaEditorNodeStatic
	// 그래프 노드의 에디터를 생성하는 클래스
	//==========================================================
	class BaristaEditorNodeStatic
	{
		static bool mInitialized;
		static AssemblyBuilder mAssemBuilder;
		static ModuleBuilder mModuleBuilder;
		static Dictionary<Type, Type> mTypeToEditor;

		static public void Init()
		{
			if( mInitialized )
				return;

			mInitialized = true;
			mTypeToEditor = new();

			foreach( Type editorType in TypeCache.GetTypesWithAttribute<BaristaNodeEditorAttribute>() )
			{
				var attr = editorType.GetCustomAttribute<BaristaNodeEditorAttribute>();
				mTypeToEditor[attr.ActionType] = editorType;
			}

			mAssemBuilder = AssemblyBuilder.DefineDynamicAssembly(new AssemblyName("BaristaNodeEditor_DynamicAssembly"), AssemblyBuilderAccess.RunAndCollect);
			mModuleBuilder = mAssemBuilder.DefineDynamicModule("MainModule");

			BaristaNodeEditorBase.mHandleSelect = StaticHandleSelect;
			BaristaNodeEditorBase.mHandleGUIEditor = StaticHandleGUI;
			BaristaNodeEditorBase.mHandleMultipleGUI = StaticHandleMultipleGUI;
			BaristaNodeEditorBase.mHandleSceneEditor = StaticHandleScene;
			BaristaNodeEditorBase.mHandleMultipleSceneEditor = StaticHandleMultipleScene;
			BaristaNodeEditorBase.mHandleUpdate = StaticHandleUpdate;
			BaristaNodeEditorBase.mHandleDeselect = StaticHandleDeselect;
		}

		static public Type GetOrCreateEditorType(Type actionType)
		{
			Init();

			if( mTypeToEditor.TryGetValue(actionType, out Type editorType) )
			{
				return editorType;
			}

			// BaristaActionEditorAttribute가 없어도 BaristaActionEditorBase를 상속받은 클래스가 있으면 에디터라고 판단한다.
			editorType = actionType.GetNestedTypes(BindingFlags.Public | BindingFlags.NonPublic).FirstOrDefault(x => x.IsSubclassOf(typeof(BaristaNodeEditorBase)));
			if( editorType == null )
			{
				Type dataType = actionType.GetNestedType("Data", BindingFlags.NonPublic | BindingFlags.Public);
				editorType = CreateDynamicEditorType(actionType, dataType);
			}

			return editorType;
		}

		static Type CreateDynamicEditorType(Type actionType, Type dataType)
		{
			if( dataType == null || dataType.GetCustomAttribute<SerializableAttribute>() == null )
				return null;

			// 동적으로 에디터 타입을 생성한다. 다음 구문을 동적으로 생성한다.
			//class [EditorName] : BaristaEditorNodeObject
			//{
			//    public Data Data;
			//}

			TypeBuilder typeBuilder = mModuleBuilder.DefineType($"Editor_{actionType.Name}_{LRandom.RandNumberString(6)}", TypeAttributes.Public, typeof(BaristaNodeEditorBase));

			typeBuilder.DefineField("Data", dataType, FieldAttributes.Public);

			Type editorType = typeBuilder.CreateType();
			return editorType;
		}

		//==========================================================
		// Editor Handler
		//==========================================================
		static void StaticHandleSelect(SerializedObject so)
		{
		}

		static void StaticHandleGUI(SerializedObject so)
		{
			EditorGUI.BeginChangeCheck();

			SerializedProperty sp = so.FindProperty("Data");
			var endProperty = sp.GetEndProperty();

			if( sp.Next(true) )
			{
				EditorGUILayout.PropertyField(sp);

				while( sp.Next(false) && !SerializedProperty.EqualContents(sp, endProperty) )
				{
					EditorGUILayout.PropertyField(sp);
				}
			}

			if( EditorGUI.EndChangeCheck() )
			{
				so.ApplyModifiedProperties();
			}
		}

		static void StaticHandleMultipleGUI(SerializedObject data, object editorData)
		{
			BaristaNodeEditorBase[] editorNodes = (BaristaNodeEditorBase[])editorData;
			SerializedObject[] nodesSo = editorNodes.Select(x => x.mEditorSO).ToArray();
			SerializedObject baseObject = (SerializedObject)data;

			EditorGUI.BeginChangeCheck();
			SerializedProperty[] nodesSp = nodesSo.Select(x => x.FindProperty("Data")).ToArray();
			SerializedProperty baseSp = baseObject.FindProperty("Data");
			var endProperty = baseSp.GetEndProperty();

			if( baseSp.Next(true) )
			{
				nodesSp.ForEach(x => x.Next(true));
				HandlePropertyType(baseSp, nodesSp);

				while( baseSp.Next(false) && !SerializedProperty.EqualContents(baseSp, endProperty) )
				{
					nodesSp.ForEach(x => x.Next(false));
					HandlePropertyType(baseSp, nodesSp);
				}
			}

			Space(10);
			HelpBox("멀티에디팅 에디터가 아직 구현되지 않은 노드입니다. \n현재는 기본 에디터를 표시하는 중...\n궁금한게 있으면 프로그래머 이선우를 찾아올 것.", MessageType.Info);

			if( EditorGUI.EndChangeCheck() )
			{
				nodesSo.ForEach(x => x.ApplyModifiedProperties());
			}
		}

		static void StaticHandleScene(SerializedObject data)
		{
		}

		static void StaticHandleMultipleScene(SerializedObject data, object editorData)
		{
		}

		static void StaticHandleUpdate(SerializedObject data, float deltaTime)
		{
		}

		static void StaticHandleDeselect(SerializedObject data)
		{
		}

		static GUIStyle IndeterminateStyle = new GUIStyle(EditorStyles.label)
		{
			normal = { textColor = Color.gray },
			fontStyle = FontStyle.Bold,
			fontSize = 24,
			fixedHeight = 18,
			contentOffset = new Vector2(152, -1)
		};

		static void HandlePropertyType(SerializedProperty baseSp, SerializedProperty[] nodesSp)
		{
			SerializedPropertyType type = baseSp.propertyType;

			switch( type )
			{
				case SerializedPropertyType.AnimationCurve:
					// 커브
					break;

				case SerializedPropertyType.Boolean:
					bool isIndeterminate = false;
					bool compareBool = baseSp.boolValue;
					foreach( SerializedProperty sp in nodesSp )
					{
						if( sp.boolValue != compareBool )
						{
							isIndeterminate = true;
							break;
						}
					}

					bool inputBool = compareBool;
					if( isIndeterminate )
					{
						bool toggleInput;

						using( Horizon() )
						{
							Rect toggleRect;
							toggleInput = EditorGUI.Toggle(toggleRect = EditorGUILayout.GetToggleRect(true), baseSp.name, false);
							GUI.Label(toggleRect, "-", IndeterminateStyle);
						}

						if( toggleInput )
						{
							inputBool = true;
							compareBool = false;
						}
					}
					else
					{
						inputBool = BoolField(baseSp.name, compareBool);
					}

					if( inputBool != compareBool )
					{
						foreach( SerializedProperty sp in nodesSp )
						{
							sp.boolValue = inputBool;
						}
					}
					break;

				case SerializedPropertyType.Color:
					// 컬러
					break;

				case SerializedPropertyType.Enum:
					// 이넘
					break;

				case SerializedPropertyType.Float:
					// 플롯
					string displayFloat = baseSp.floatValue.ToString();
					float compareFloat = baseSp.floatValue;
					foreach( SerializedProperty sp in nodesSp )
					{
						if( sp.floatValue != compareFloat )
						{
							displayFloat = "-";
							break;
						}
					}

					string inputFloat;
					if( displayFloat == "-" )
					{
						inputFloat = TextField(baseSp.name, displayFloat);
					}
					else
					{
						inputFloat = FloatField(baseSp.name, compareFloat).ToString();
					}

					if( inputFloat != displayFloat )
					{
						float floatValue = inputFloat.ToFloatSafe(float.MaxValue);
						if( floatValue != float.MaxValue )
						{
							foreach( SerializedProperty sp in nodesSp )
							{
								sp.floatValue = floatValue;
							}
						}
					}
					break;

				case SerializedPropertyType.Integer:
					string displayInt = baseSp.intValue.ToString();
					int compareInt = baseSp.intValue;
					foreach( SerializedProperty sp in nodesSp )
					{
						if( sp.intValue != compareInt )
						{
							displayInt = "-";
							break;
						}
					}

					string inputInt;
					if( displayInt == "-" )
					{
						inputInt = TextField(baseSp.name, displayInt);
					}
					else
					{
						inputInt = IntField(baseSp.name, compareInt).ToString();
					}

					if( inputInt != displayInt )
					{
						int intValue = inputInt.ToIntSafe(int.MaxValue);
						if( intValue != int.MaxValue )
						{
							foreach( SerializedProperty sp in nodesSp )
							{
								sp.intValue = intValue;
							}
						}
					}
					break;

				case SerializedPropertyType.String:
					string compareString = baseSp.stringValue;
					foreach( SerializedProperty sp in nodesSp )
					{
						if( sp.stringValue != compareString )
						{
							compareString = "-";
							break;
						}
					}

					string inputString = TextField(baseSp.name, compareString);
					if( inputString != compareString )
					{
						foreach( SerializedProperty sp in nodesSp )
						{
							sp.stringValue = inputString;
						}
					}
					break;

				case SerializedPropertyType.Vector2: // 아 몰라... 나중에 if generic + "LVector2" -> boxedValue로 바꾸자...
					//Vector2 inputVec = baseSp.vector2Value;
					//string displayX = inputVec.x.ToString();
					//string displayY = inputVec.y.ToString();
					//foreach( SerializedProperty sp in nodesSp )
					//{
					//	if( sp.vector2Value.x.ToString() != displayX )
					//	{
					//		displayX = "-";
					//	}
					//	if( sp.vector2Value.y.ToString() != displayY )
					//	{
					//		displayY = "-";
					//	}
					//}

					//if( displayX == "-" || displayY == "-" )
					//{
					//	string vec2X;
					//	string vec2Y;

					//	using( Horizon() )
					//	{
					//		EditorGUILayout.PrefixLabel(baseSp.name);

					//		using var _ = AdjustIndent();

					//		vec2X = displayX == "-" ? HorzTextField("X", displayX) : HorzFloatField("X", inputVec.x).ToString();
					//		vec2Y = displayY == "-" ? HorzTextField("Y", displayY) : HorzFloatField("Y", inputVec.y).ToString();
					//	}

					//	if( vec2X != displayX || vec2Y != displayY )
					//	{
					//		inputVec = new Vector2(vec2X.ToFloatSafe(inputVec.x), vec2Y.ToFloatSafe(inputVec.y));
					//	}
					//}
					//else
					//{
					//	inputVec = Vector2Field(baseSp.name, baseSp.vector2Value);
					//}

					//if( inputVec != baseSp.vector2Value )
					//{
					//	foreach( SerializedProperty sp in nodesSp )
					//	{
					//		sp.vector2Value = inputVec;
					//	}
					//}
					break;

				case SerializedPropertyType.Vector3:
					// 벡터3
					break;

				case SerializedPropertyType.Vector4:
					// 벡터4
					break;
			}
		}
	}
}
