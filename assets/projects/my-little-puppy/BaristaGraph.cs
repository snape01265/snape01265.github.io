using System;
using System.Collections.Generic;
using LmgLib;
using LmgLib.Unity;
using UnityEngine;
using System.Linq;
using System.Reflection;

namespace Puppy
{
	//==========================================================
	// 바리스타 그래프
	//==========================================================
	[Serializable]
	public class BaristaGraphData
	{
		public string Name;
		public string Desc;

		public List<BaristaNode> Nodes;
		public List<BaristaGraphConnection> Connections;
		public List<BaristaGroup> Groups;

		Dictionary<string, BaristaNode> mNodeDictionary;
		Dictionary<string, BaristaGroup> mGroupDictionary;

		public bool IsEmpty => Nodes == null || Nodes.Count <= 1;       // 시작노드만 있으면 비어있다고 판단
		public bool IsNotEmpty => IsEmpty == false;

		public void Init()
		{
			if( mNodeDictionary == null )
				mNodeDictionary = new Dictionary<string, BaristaNode>();

			if( mGroupDictionary == null )
				mGroupDictionary = new Dictionary<string, BaristaGroup>();

			if( Nodes == null )
				Nodes = new List<BaristaNode>();

			if( Connections == null )
				Connections = new List<BaristaGraphConnection>();

			if( Groups == null )
				Groups = new List<BaristaGroup>();

			CheckStartNode();

			foreach( BaristaNode node in Nodes )
			{
				if( GetNode(node.Property.ID) == null )
				{
					mNodeDictionary.Add(node.Property.ID, node);
				}
			}

			foreach( BaristaGroup group in Groups )
			{
				if( GetGroup(group.GroupID) == null )
				{
					mGroupDictionary.Add(group.GroupID, group);
				}
			}
		}

		void CheckStartNode()
		{
			if( !Nodes.Contains(node => node.ActionType == "Start") )
			{
				CreateStartNode();
			}

			while( Nodes.FindAll(node => node.ActionType == "Start").Count > 1 )
			{
				BaristaNode startNode = Nodes.FindLast(node => node.ActionType == "Start");
				Nodes.Remove(startNode);
			}
		}

		public void AddNode(BaristaNode node)
		{
			Nodes.Add(node);
			mNodeDictionary.Add(node.Property.ID, node);
		}

		public void RemoveNode(string nodeID)
		{
			BaristaNode node = mNodeDictionary[nodeID];

			if ( node == null )
				return;

			Nodes.Remove(node);
			mNodeDictionary.Remove(nodeID);
		}

		public void CreateNewGroup(string groupID, string groupTitle, LVector2 pos)
		{
			BaristaGroup group = new BaristaGroup(groupID, groupTitle, pos);
			Groups.Add(group);
			mGroupDictionary.Add(groupID, group);
		}

		public void AddGroup(BaristaGroup group)
		{
			Groups.Add(group);
			mGroupDictionary.Add(group.GroupID, group);
		}

		public void RemoveGroup(string groupID)
		{
			BaristaGroup group = GetGroup(groupID);

			if( group == null )
				return;

			Groups.Remove(group);
			mGroupDictionary.Remove(groupID);
		}

		public void AddNodeToGroup(string groupID, string nodeID)
		{
			BaristaGroup group = GetGroup(groupID);
			BaristaNode node = GetNode(nodeID);

			if( node == null || group == null )
				return;

			group.AddNode(node.Property.ID);
		}

		public void RemoveNodeFromGroup(string groupID, string nodeID)
		{
			BaristaGroup group = GetGroup(groupID);
			BaristaNode node = GetNode(nodeID);

			if( node == null || group == null )
				return;

			group.RemoveNode(node.Property.ID);
		}

		void CreateStartNode()
		{
			BaristaNode node = new BaristaNode();
			node.MenuPath = "시작";
			node.SetPosition(new LVector2(450, 0));
			node.ActionType = "Start";

			Type typeInfo = typeof(BaristaAction_Start);
			PropertyInfo propertyInfo = typeInfo.GetProperty("NodePropertyData", BindingFlags.Public | BindingFlags.Instance);
			NodePropertyData data = propertyInfo.GetValue(Activator.CreateInstance(typeInfo)) as NodePropertyData;
			node.Property.CopyPortData(data);

			AddNode(node);
		}

		public BaristaNode GetStartNode()
		{
			BaristaNode start = Nodes.Single(node => node.Property.Input == false);

			LDebug.Assert(start != null, "Start Node가 없습니다.");

			return start;
		}

		public BaristaNode GetNode(string nextNodeId)
		{
			if( mNodeDictionary.TryGetValue(nextNodeId, out BaristaNode node) )
				return node;

			return null;
		}

		public BaristaGroup GetGroup(string groupID)
		{
			if( mGroupDictionary.TryGetValue(groupID, out BaristaGroup group) )
				return group;

			return null;
		}

		public BaristaNode[] GetNextNodes(BaristaNode node)
		{
			List<string> addedNodes = new List<string>();
			BaristaNode[] nextNodes = new BaristaNode[0];
			string outputNodeId = node.Property.ID;

			foreach( BaristaGraphConnection connection in Connections )
			{
				if( addedNodes.Contains(connection.InputPort.NodeID) )
					continue;

				if( connection.OutputPort.NodeID == outputNodeId && connection.OutputPort.PortIndex == 0 )
				{
					string nodeId = connection.InputPort.NodeID;
					addedNodes.Add(nodeId);
					BaristaNode inputNode = mNodeDictionary[nodeId];
					nextNodes = nextNodes.Append(inputNode);
				}
			}

			return nextNodes;
		}
	}

	//==========================================================
	// NodeSearchMask
	// 검색을 할 때 보여주는 여부를 담은 데이터
	//==========================================================
	[Flags]
	public enum NodeSearchMask
	{
		None = 0,					// 모든 검색에서 보여줌
		Cutscene = 1 << 1,			// 컷씬 바리스타 그래프 검색에서 제외
		Gameplay = 1 << 2,			// 게임플레이 바리스타 그래프 검색에서 제외
		All = 0xFF					// 모든 검색에서 제외
	}

	//==========================================================
	//  NodePropertyData
	//  노드의 속성에 관한 데이터를 담는 클래스
	//  Input, Output, GUID같이 노드가 필수적으로 가져야하는 데이터를 담는다.
	//==========================================================
	[Serializable]
	public class NodePropertyData
	{
		public bool Input;
		public bool Output;

		[SerializeField]
		string mGuid;
		[SerializeField]
		Rect mPos;

		public string ID 
		{ 
			get { return mGuid; } 
			set { mGuid = value; } 
		}

		public Rect Pos 
		{ 
			get { return mPos; } 
			set { mPos = value; } 
		}

		public void CopyPortData(NodePropertyData data)
		{
			Input = data.Input;
			Output = data.Output;
		}
	}

	//==========================================================
	// 바리스타 노드
	//==========================================================
	[Serializable]
	public class BaristaNode
	{
		public enum State
		{
			Waiting,
			Running,
			Complete,
			Failed,
		}

		public string MenuPath;
		public string Desc;
		public float StartDelay;
		public string ActionType;
		public string JsonData;
		public string CheckPointCondition;
		public NodePropertyData Property;
		public State NodeState;

		public BaristaNode()
		{
			Property = new NodePropertyData();
			NewGUID();
		}

		public void CopyData(BaristaNode node)
		{
			this.MenuPath = node.MenuPath;
			this.Desc = node.Desc;
			this.StartDelay = node.StartDelay;
			this.ActionType = node.ActionType;
			this.JsonData = node.JsonData;
			this.CheckPointCondition = node.CheckPointCondition;
			this.Property.CopyPortData(node.Property); // GUID, Pos는 복사하지 않는다.
		}

		void NewGUID()
		{
			Property.ID = Guid.NewGuid().ToString();
		}

		public void SetPosition(Rect pos)
		{
			Property.Pos = pos;
		}

		public void SetPosition(LVector2 pos)
		{
			Property.Pos = new Rect(pos, LVector2.Zero);
		}
	}

	//==========================================================
	// 바리스타 그룹
	//==========================================================
	[Serializable]
	public class BaristaGroup
	{
		public List<string> Nodes;
		public string GroupID;
		public string GroupTitle;
		public LVector2 GroupPos;

		public BaristaGroup(string groupID, string groupTitle, LVector2 groupPos)
		{
			Nodes = null;
			GroupID = groupID;
			GroupTitle = groupTitle;
			GroupPos = groupPos;
		}

		public BaristaGroup(string groupTitle, LVector2 groupPos)
		{
			Nodes = null;
			GroupID = Guid.NewGuid().ToString();
			GroupTitle = groupTitle;
			GroupPos = groupPos;
		}

		public void AddNode(string nodeID)
		{
			if( Nodes == null )
				Nodes = new List<string>();

			if( Nodes.Contains(nodeID) )
				return;

			Nodes.Add(nodeID);
		}

		public void RemoveNode(string nodeID)
		{
			if( Nodes == null )
				return;

			if( !Nodes.Contains(nodeID) )
				return;

			Nodes.Remove(nodeID);
		}

		public bool HasNode(string nodeID)
		{
			if( Nodes == null )
				return false;

			return Nodes.Contains(nodeID);
		}

		public void SetPosition(Rect pos)
		{
			GroupPos = pos.position;
		}

		public void SetPosition(LVector2 pos)
		{
			GroupPos = pos;
		}
	}
}
