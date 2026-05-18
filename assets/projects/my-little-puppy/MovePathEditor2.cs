using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using LmgLib;
using LmgLib.Unity;
using System.Linq;

namespace Puppy
{
	//==========================================================
	// MovePathPropertyDrawer
	//==========================================================
	[CustomPropertyDrawer(typeof(MovePath2))]
	public class MovePathPropertyDrawer : LCustomPropertyHandler
	{
		bool mWarningScale;

		public override bool CanHandleProperty => true;

		public override void HandleGUI(Rect rect, SerializedProperty property, GUIContent label)
		{
			var mp = property.boxedValue as MovePath2;

			if( mp.Points == null )
				mp.Points = new MovePath2.Point[0];

			Rect line = rect.WithHeight(EditorGUIUtility.singleLineHeight);

			line = EditorGUI.PrefixLabel(line, label);
			EditorGUI.LabelField(line, $"Points: {mp.Points.Length}개");

			if( GUI.Button(line.WithWidthRight(30), LSolidEditor.Resources.RectIcon) )
			{
				MovePathEditor2.Open(property, Event.current.control == false);
			}

			if( GUI.Button(line.WithWidthRight(60).WithWidth(25), LSolidEditor.Resources.EyeOnIcon) )
			{
				FramePath(mp, property.serializedObject.targetObject);
			}

			if( mWarningScale )
			{
				EditorGUI.HelpBox(rect.WithHeightBottom(WarningBoxHeight), "MovePath가 상대좌표일 때 스케일이 있으면 안됩니다", MessageType.Error);
			}
		}

		const float WarningBoxHeight = 30;

		public override float GetGUIHeight(SerializedProperty property, GUIContent label)
		{
			mWarningScale = false;

			var mp = (MovePath2)property.structValue;

			if( mp.Flags.Contains(MovePath2.Flag.Relative) )
			{
				UnityEngine.Object target = property.serializedObject.targetObject;
				if( target is Component c )
				{
					Transform tm = c.transform;
					LVector3 worldScale = tm.lossyScale;

					mWarningScale = worldScale.X.IsEqual(1) == false || worldScale.Y.IsEqual(1) == false || worldScale.Z.IsEqual(1) == false;
				}
			}

			return EditorGUIUtility.singleLineHeight + (mWarningScale ? WarningBoxHeight + 4 : 0);
		}

		void FramePath(MovePath2 mp, UnityEngine.Object target)
		{
			LBoundBox bb = LBoundBox.Empty;
			Component comp = target as Component;
			Matrix4x4 mat = mp.Flags.Contains(MovePath2.Flag.Relative) && comp != null ? comp.transform.localToWorldMatrix : Matrix4x4.identity;

			for( int i = 0; i < mp.Points.Length; i++ )
			{
				bb.Add(mat.MultiplyPoint3x4(mp.Points[i].Pts));
			}

			LSolidEditor.FrameSceneView(bb.Center, bb.Extent);
		}
	}


	//==========================================================
	// MovePathEditor2
	//==========================================================
	public class MovePathEditor2 : LSolidEditor
	{
		class MovePathEditor2Window : Window { }

		[InitializeOnLoadMethod]
		static void Init()
		{
			// Assembly-CSharp 어셈블리에서 Editor 어셈블리 호출하기 위한 adapter
			MovePathEditor2Adapter.mOpen = (sp, closeOtherWindows) => Open(sp, closeOtherWindows);
			MovePathEditor2Adapter.mOpen2 = (arg1, arg2, arg3, arg4) => Open(arg1, arg2, arg3, arg4);
		}

		WidgetInst mWidget = new WidgetInst("MovePathEditor2");
		SavedColor TangentColor = new SavedColor("MovePathEditor2.Tangent", Color.white);
		SavedColor DirColor = new SavedColor("MovePathEditor2.DirColor", new Color(0, 1, 0.7f));

		float LineThick => mWidget.LineThick;
		float DotSize => LineThick * 6;

		EditorSavedProperty<MovePath2> mProperty;
		Transform mTm;

		MovePath2 mMovePath;
		HashSet<int> mSelected = new();

		List<LVector3> mLineSegments = new();
		List<int> mSegIndices = new();
		List<int> mPtsToSegIndices = new();
		List<bool> mPointFold = new();

		bool mShowDirWidget = true;
		bool mFreezeRoll = true;
		float mDirWidgetLen = 1.7f;

		LVector3 mInitPos;
		Quaternion mInitRot;

		bool IsLoop => mMovePath.Flags.Contains(MovePath2.Flag.Loop);
		bool IsFlyingPath => mMovePath.Flags.Contains(MovePath2.Flag.FlyingPath);
		bool IsSmooth => mMovePath.Flags.Contains(MovePath2.Flag.Smooth);
		bool IsDirectional => mMovePath.Flags.Contains(MovePath2.Flag.Direction);
		bool IsRelative => mMovePath.Flags.Contains(MovePath2.Flag.Relative);

		static MovePath2 CopyPath;

		public static MovePathEditor2 Open(SerializedProperty sp, bool closeOtherWindows = true)
		{
			var editor = CreateInstance<MovePathEditor2>();

			editor.mProperty = new EditorSavedProperty<MovePath2>(sp);

			editor.OpenWindow(closeOtherWindows);

			return editor;
		}

		public static MovePathEditor2 Open(MovePath2 path, Component container, Action<MovePath2> applyAction = null, bool closeOtherWindows = true)
		{
			var editor = CreateInstance<MovePathEditor2>();

			editor.mProperty = new EditorSavedProperty<MovePath2>(path, container, applyAction);

			editor.OpenWindow(closeOtherWindows);

			return editor;
		}

		public override void OnCreate()
		{
			LoadData();

			if( mMovePath.Points == null || mMovePath.Points.Length == 0 )
			{
				ResetPoints();
			}

			mMovePath.TotalLength = GenerateLineSegments();
			mPointFold = Enumerable.Repeat(false, mMovePath.Points.Length).ToList();
		}

		public override void OnClose()
		{
		}

		void LoadData()
		{
			mMovePath = mProperty.Update();
			mTm = mProperty.mComponent != null ? mProperty.mComponent.transform : null;
			if( mMovePath.RelativeActorName.IsValid() )
				FindTargetActor(mMovePath.RelativeActorName);

			if( mTm != null )
			{
				mInitPos = mTm.position;
				mInitRot = mTm.rotation;
			}
		}

		void ApplyData()
		{
			mMovePath.TotalLength = GenerateLineSegments();

			mProperty.Apply();
		}


		//==========================================================
		// Point Management
		//==========================================================
		MovePath2.Point NewPoint(LVector3 pt)
		{
			return new MovePath2.Point(Floor(pt));
		}

		ref MovePath2.Point Point(int index)
		{
			return ref mMovePath.Points[index];
		}

		int PointCount => mMovePath.Points.Length;

		void AutoTangent(int index)
		{
			ref var p = ref Point(index);
			LVector3 prev, next;

			if( IsLoop )
			{
				prev = Point((index - 1 + PointCount) % PointCount).Pts;
				next = Point((index + 1) % PointCount).Pts;
			}
			else
			{
				prev = Point(LMath.Clamp(index - 1, 0, PointCount - 1)).Pts;
				next = Point(LMath.Clamp(index + 1, 0, PointCount - 1)).Pts;
			}

			p.Tangent = (next - prev) * 0.5f;

			SetChanged();
		}

		void AutoRotation(int index)
		{
			ref var p = ref Point(index);

			if( IsSmooth )
			{
				p.Quat = Quaternion.LookRotation(p.Tangent);
			}
			else
			{
				LVector3 prev, next;

				if( IsLoop )
				{
					prev = Point((index - 1 + PointCount) % PointCount).Pts;
					next = Point((index + 1) % PointCount).Pts;
				}
				else
				{
					prev = Point(LMath.Clamp(index - 1, 0, PointCount - 1)).Pts;
					next = Point(LMath.Clamp(index + 1, 0, PointCount - 1)).Pts;
				}

				LVector3 tangent = (next - prev) * 0.5f;
				p.Quat = Quaternion.LookRotation(tangent);
			}

			SetChanged();
		}

		void InsertPoint(int afterThis, LVector3? p = null, bool fromMenu = false)
		{
			if( p == null )
			{
				if( afterThis == -1 )
				{
					p = LVector3.Lerp(Point(0).Pts, Point(1).Pts, -0.5f);
				}
				else if( afterThis == PointCount - 1 )
				{
					p = LVector3.Lerp(Point(afterThis - 1).Pts, Point(afterThis).Pts, 1.5f);
				}
				else
				{
					p = LVector3.Lerp(Point(afterThis).Pts, Point(afterThis + 1).Pts, 0.5f);
				}
			}

			int newIndex = afterThis + 1;
			mMovePath.Points = mMovePath.Points.InsertWithResize(newIndex, NewPoint(p.Value));

			AutoTangent(newIndex);

			ArrangeExtraIndices(newIndex, true);

			mPointFold.Insert(newIndex, false);

			if( fromMenu )
				ApplyData();
			else
				SetChanged();
		}

		void DeletePoint(int index, bool fromMenu = false)
		{
			mMovePath.Points = mMovePath.Points.RemoveWithResize(index);

			ArrangeExtraIndices(index, false);

			mPointFold.RemoveAt(index);

			if( fromMenu )
				ApplyData();
			else
				SetChanged();
		}

		void ArrangeExtraIndices(int index, bool isAdd)
		{
			ref MovePath2.PointExtra[] extras = ref mMovePath.Extras;

			if( isAdd )
			{
				for( int i = 0; i < extras.Length; i++ )
				{
					if( index <= extras[i].PointIndex )
					{
						extras[i].PointIndex++;
					}
				}
			}
			else
			{
				for( int i = extras.Length - 1; i >= 0; i-- )
				{
					if( index == extras[i].PointIndex )
					{
						extras = extras.RemoveWithResize(i);
					}
					else if( index < extras[i].PointIndex )
					{
						extras[i].PointIndex--;
					}
				}
			}
		}

		int FindPointExtra(int index)
		{
			return mMovePath.Extras.FindFirstIndex(x => x.PointIndex == index);
		}

		void AddExtraData(int index)
		{
			mMovePath.Extras = mMovePath.Extras.Append(new MovePath2.PointExtra() { PointIndex = index }).OrderBy(x => x.PointIndex).ToArray();
			ValidateExtraData();
		}

		void DeleteExtraData(int extraIndex)
		{
			mMovePath.Extras = mMovePath.Extras.RemoveWithResize(extraIndex);
			ValidateExtraData();
		}

		void ValidateExtraData()
		{
			// Copy / Paste등으로 데이터 불일치가 발생할 수 있다.
			mMovePath.Extras = mMovePath.Extras.Where(x => x.PointIndex < PointCount).ToArray();
		}

		void AddGameObjectPoint()
		{
			LDebug.Assert(IsRelative == false);     // 절대 좌표 상태에서만 가능하다.

			LVector3 worldPos = mTm.position;
			Quaternion worldEuler = mTm.rotation;

			var point = new MovePath2.Point();
			point.Pts = worldPos;
			point.Quat = worldEuler;

			mMovePath.Points = mMovePath.Points.Append(point);

			mPointFold.Add(false);

			SetChanged();
		}


		//==========================================================
		// HandleGUI
		//==========================================================
		public override void HandleGUI()
		{
			if( mProperty.IsReadOnly )
			{
				HelpBox("해당 데이터는 읽기 전용입니다.", MessageType.Info);
				return;
			}

			using var _1 = UndoScope(mProperty.mTarget);

			ViewGUI();

			BeginChange();

			PathFlags();
			PathPoints();

			FlexibleSpace();

			ToolGUI();
			TesterGUI();

			if( IsChanged() )
			{
				ApplyData();
			}
		}

		void ViewGUI()
		{
			using( Group("View") )
			{
				using( Horizon() )
				{
					mWidget.HandleGUI();

					Space(10);

					using( LabelWidth("Tangent", 5) )
						TangentColor.value = EditorGUILayout.ColorField(ImgText("Tangent"), TangentColor, false, true, false, Width(GetLabelWidth() + 25));
				}
			}
		}

		void PathFlags()
		{
			using var _1 = Group();
			using var _2 = LabelWidth(80);

			MovePath2.Flag prev = mMovePath.Flags;

			BeginChange();

			mMovePath.Flags = EnumFlags("Flags", mMovePath.Flags);

			if( IsChanged() )
			{
				if( prev.Contains(MovePath2.Flag.FlyingPath) == false && mMovePath.Flags.Contains(MovePath2.Flag.FlyingPath) )
				{
					SetOnGround();
				}
				else if( prev.Contains(MovePath2.Flag.FlyingPath) == true && !mMovePath.Flags.Contains(MovePath2.Flag.FlyingPath) )
				{
					SetOnGround();
				}

				if( prev.Contains(MovePath2.Flag.Relative) != mMovePath.Flags.Contains(MovePath2.Flag.Relative) )
				{
					ChangeRelative(mMovePath.Flags.Contains(MovePath2.Flag.Relative));
				}

				if( mMovePath.Flags.Contains(MovePath2.Flag.Direction) )
				{
					mShowDirWidget = true;
					mFreezeRoll = true;
				}
			}

			Space(10);

			using( Horizon() )
			{
				EditorGUILayout.PrefixLabel("Widgets");

				if( IsDirectional )
				{
					mShowDirWidget = BoolField("Direction", mShowDirWidget, true, Width(80));
					mFreezeRoll = BoolField("Freeze Z-Rot", mFreezeRoll, true, Width(120));

					if( mShowDirWidget )
					{
						mDirWidgetLen = ExpFloatSlider(null, mDirWidgetLen, 0.1f, 10.0f, 4, false, -1, 100);
						Space(5);
						DirColor.value = EditorGUILayout.ColorField(GUIContent.none, DirColor, false, true, false, Width(25));
					}
				}
				if( IsRelative )
				{
					using( Horizon() )
					{
						string targetName = HorzTextField("Relative Target Actor", mMovePath.RelativeActorName, options: Width(300));
						if( targetName != mMovePath.RelativeActorName )
							FindTargetActor(targetName);

						Space(10);

						mMovePath.IgnoreTargetRot = BoolField("Ignore Target Rotation", mMovePath.IgnoreTargetRot, true, Width(150));
					}
				}

				FlexibleSpace();
			}
		}

		Vector2 mScrollPos;
		bool mEnsureSelectScroll;

		void FindTargetActor(string name)
		{
			Transform targetTm = null;
			ActorRegister[] actors = LUtil.GetRootObjects().First(root => root.GetComponent<ChapterData>()).GetComponentsInChildren<ActorRegister>(true);
			
			for( int i = 0; i < actors.Length; i++ )
			{
				ActorRegister ar = actors[i];

				if( ar.InstanceName == name )
				{
					targetTm = ar.transform;
					break;
				}
			}

			if( targetTm != null )
				mTm = targetTm;
			else
				mTm = mProperty.mComponent != null ? mProperty.mComponent.transform : null;
			mMovePath.RelativeActorName = name;
		}

		void PathPoints()
		{
			using var _1 = FoldableGroup("Points");
			if( IsFolded )
				return;

			using var _2 = Scroll(ref mScrollPos);
			using var _3 = LabelWidth(80);

			Rect scrollRect = GroupRect;
			float selectFrom = float.MaxValue;
			float selectTo = float.MinValue;

			int delete = -1;

			for( int i = 0; i < PointCount; i++ )
			{
				ref MovePath2.Point p = ref Point(i);
				bool selected = mSelected.Contains(i);
				int extraIndex = FindPointExtra(i);

				Color selectColor = IsDarkMode ? new Color(1, 1, 0) : new Color(1, 1, 0.8f);

				using( GUIColorScope(selected ? selectColor : Color.white) )
				{
					Rect lineRect;
					using( Horizon() )
					{
						lineRect = DirRect;

						if( Button(extraIndex != -1 ? Resources.Gear2Icon : Resources.GearIcon, 18, 18, FlatButtonStyle) )
							mPointFold[i] = !mPointFold[i];

						EditorGUILayout.PrefixLabel($"Point #{i + 1}");
						Space(5);

						Vector3Field(null, ref p.X, ref p.Y, ref p.Z, "X", "Y", "Z", ExpandWidth(), MinWidth(200));
						if( IsDirectional )
						{
							Space(50);
							LVector3 euler = p.Quat.eulerAngles;
							Vector2Field(null, ref euler.X, ref euler.Y, "Yaw", "Pitch");
							if( mFreezeRoll == false )
								euler.Z = HorzFloatField("Roll", euler.Z);
							p.Quat = Quaternion.Euler(euler);
						}

						//FlexibleSpace();
						Space(30);

						if( Button(ImgText("T", "Auto Tangent"), 25, 18) )
						{
							AutoTangent(i);
						}

						if( Button(ImgText("R", "Auto Rotation"), 25, 18) )
						{
							AutoRotation(i);
						}

						if( Button(Resources.EyeIcon, 25, 18) )
						{
							FrameSceneView(WorldPos(p.Pts), new LVector3(2));
						}

						if( Button(ImgText(Resources.CrossIcon), 25, 18) )
						{
							delete = i;
						}
					}

					if( IsMouseClickGroup(lineRect) )
					{
						mSelected.Clear();
						mSelected.Add(i);
					}

					if( IsMouseClickGroup(lineRect, true) )
					{
						// 포인트로 이동
						FrameSceneView(WorldPos(p.Pts), new LVector3(2));
					}

					// 선택된 포인트가 스크롤 안에 안 보이면 스크롤 위치를 조절한다.
					if( selected )
					{
						if( Event.current.type == EventType.Repaint )
						{
							selectFrom = LMath.Min(selectFrom, lineRect.yMin);
							selectTo = LMath.Max(selectTo, lineRect.yMax);
						}
					}
				}

				if( mPointFold.GetAtSafe(i) )
				{
					ExtraPoint(i, extraIndex);
					HorizonLine(3);
				}
			}

			if( delete != -1 )
				DeletePoint(delete);

			if( mEnsureSelectScroll && Event.current.type == EventType.Repaint )
			{
				if( selectFrom < selectTo )
				{
					float visibleFrom = mScrollPos.y;
					float visibleTo = visibleFrom + scrollRect.height;

					//LDebug.Log($"Selected: {selectFrom}~{selectTo} (visible:{visibleFrom}~{visibleTo})");

					if( selectFrom < visibleFrom )
					{
						mScrollPos.y -= visibleFrom - selectFrom;
						Repaint();
					}
					else if( visibleTo < selectTo )
					{
						mScrollPos.y += selectTo - visibleTo;
						Repaint();
					}
				}

				mEnsureSelectScroll = false;
			}
		}


		//==========================================================
		// Extra Point
		//==========================================================
		GUIStyle mExtraStyle;

		void ExtraPoint(int index, int extraIndex)
		{
			if( mExtraStyle == null )
				mExtraStyle = CreateGroupStyle(GroupColorFromDepth(1), new LInt4(0, 0, 0, 0), new LInt4(30, 0, 0, 0));

			using var _1 = Group(null, mExtraStyle);
			using var _2 = LabelWidth(120);

			if( extraIndex == -1 )
			{
				if( Button(ImgText(Resources.PlusIcon, "추가 데이터 생성"), 140, 20) )
					AddExtraData(index);

				return;
			}

			if( Button(ImgText(Resources.MinusIcon, "추가 데이터 삭제"), 140, 20) )
			{
				DeleteExtraData(extraIndex);
				return;
			}

			ref var extra = ref mMovePath.Extras[extraIndex];

			// Move Setting
			ExtraPointSpeed(ref extra);

			// Fall Setting
			ExtraPointJump(ref extra);

			// Animation
			ExtraPointAnim(ref extra);

			// Camera Data
			ExtraPointCamera(ref extra);

			// Barista
			ExtraPointBarista(ref extra, index, extraIndex);
		}

		enum ExtraSpeedEnum
		{
			[InspectorName("기존 속도 유지")] Keep,
			[InspectorName("Walk Speed")] Walk,
			[InspectorName("Run Speed")] Run,
			[InspectorName("Stop")] Stop,
			[InspectorName("이동 속도 지정")] Custom
		}

		void ExtraPointSpeed(ref MovePath2.PointExtra extra)
		{
			using var _1 = Horizon();

			ExtraSpeedEnum e = extra.MoveSpeed.IsEqual(PathSpeedType.Keep) ? ExtraSpeedEnum.Keep :
							   extra.MoveSpeed.IsEqual(PathSpeedType.Walk) ? ExtraSpeedEnum.Walk :
							   extra.MoveSpeed.IsEqual(PathSpeedType.Run) ? ExtraSpeedEnum.Run :
							   extra.MoveSpeed.IsEqual(PathSpeedType.Stop) ? ExtraSpeedEnum.Stop : ExtraSpeedEnum.Custom;

			var ne = EnumField("Move Speed", e);

			if( e != ne && ne == ExtraSpeedEnum.Custom )
				extra.MoveSpeed = 1;

			extra.MoveSpeed = ne switch
			{
				ExtraSpeedEnum.Keep => PathSpeedType.Keep,
				ExtraSpeedEnum.Walk => PathSpeedType.Walk,
				ExtraSpeedEnum.Run => PathSpeedType.Run,
				ExtraSpeedEnum.Stop => PathSpeedType.Stop,
				ExtraSpeedEnum.Custom => DelayedHorzFloatField(null, extra.MoveSpeed),
				_ => 0
			};

			extra.MoveSpeedLerp = ne switch
			{
				ExtraSpeedEnum.Keep => -1,
				ExtraSpeedEnum.Walk => FloatField("Lerp Duration", extra.MoveSpeedLerp, options: Width(180)),
				ExtraSpeedEnum.Run => FloatField("Lerp Duration", extra.MoveSpeedLerp, options: Width(180)),
				ExtraSpeedEnum.Stop => FloatField("Lerp Duration", extra.MoveSpeedLerp, options: Width(180)),
				ExtraSpeedEnum.Custom => FloatField("Lerp Duration", extra.MoveSpeedLerp, options: Width(180)),
				_ => 0
			};

			if( ne != ExtraSpeedEnum.Keep )
				extra.MoveSpeedLerp = LMath.Max(0, extra.MoveSpeedLerp);
		}

		enum ExtraJumpEnum
		{
			[InspectorName("점프 없음")] None,
			[InspectorName("캐릭터 점프력 유지")] Keep,
			[InspectorName("점프력 지정")] Custom,
		}

		void ExtraPointJump(ref MovePath2.PointExtra extra)
		{
			using var _1 = Horizon();
			const float keepVar = -1;

			ExtraJumpEnum e = extra.JumpHeight.IsEqual(0) ? ExtraJumpEnum.None : 
							  extra.JumpHeight.IsEqual(keepVar) ? ExtraJumpEnum.Keep : ExtraJumpEnum.Custom;

			var ne = EnumField("Jump Height", e);

			if( e != ne && ne == ExtraJumpEnum.Custom )
				extra.JumpHeight = 1;
			if( e != ne && ne != ExtraJumpEnum.None && extra.AnimClip.IsEmpty() )
				extra.AnimClip = "Jump";

			extra.JumpHeight = ne switch
			{
				ExtraJumpEnum.None => 0f,
				ExtraJumpEnum.Keep => keepVar,
				ExtraJumpEnum.Custom => DelayedHorzFloatField(null, extra.JumpHeight),
				_ => 0
			};

			if( ne != ExtraJumpEnum.None )
			{
				if( e != ne )
				{
					extra.JumpStartEnabled = true;
					extra.JumpEndEnabled = true;
				}

				using( Horizon() )
				{
					EditorGUILayout.PrefixLabel("점프 옵션");
					Space(4);

					using( LabelWidth(120) )
					{
						extra.JumpStartEnabled = BoolField("시작 애니메이션", extra.JumpStartEnabled);
						Space(20);
						extra.JumpEndEnabled = BoolField("끝 애니메이션", extra.JumpEndEnabled);
						extra.JumpEndAnimClip = TextField("클립 이름", extra.JumpEndAnimClip);
					}
				}

				if( extra.JumpEndAnimClip.IsEmpty() )
				{
					extra.JumpEndAnimClip = "JumpEnd";
				}
			}
		}

		enum ExtraAnimEnum
		{
			[InspectorName("기존 애니 유지")] Keep,
			Walk,
			Run,
			Jump,
			Custom
		}

		enum ExtraAnimSpeedEnum
		{
			[InspectorName("속도 유지")] Keep,
			[InspectorName("속도 지정")] Custom,
		}

		void ExtraPointAnim(ref MovePath2.PointExtra extra)
		{
			using var _1 = Horizon();

			ExtraAnimEnum e = extra.AnimClip.IsEmpty() ? ExtraAnimEnum.Keep :
							  extra.AnimClip == "Walk" ? ExtraAnimEnum.Walk :
							  extra.AnimClip == "Run" ? ExtraAnimEnum.Run :
							  extra.AnimClip == "Jump" ? ExtraAnimEnum.Jump :
							  ExtraAnimEnum.Custom;

			var ne = EnumField("Move Animation", e, MinWidth(200));

			if( e != ne && ne == ExtraAnimEnum.Custom )
				extra.AnimClip = "Custom Anim Clip";

			extra.AnimClip = ne switch
			{
				ExtraAnimEnum.Keep => null,
				ExtraAnimEnum.Walk => "Walk",
				ExtraAnimEnum.Run => "Run",
				ExtraAnimEnum.Jump => "Jump",
				ExtraAnimEnum.Custom => DelayedTextField(null, extra.AnimClip),
				_ => ""
			};

			Space(10);

			var se = extra.AnimSpeed == 0 ? ExtraAnimSpeedEnum.Keep : ExtraAnimSpeedEnum.Custom;
			var nse = EnumField(null, se, Width(se == ExtraAnimSpeedEnum.Keep ? 118 : 75));
			if( se != nse )
				extra.AnimSpeed = nse == ExtraAnimSpeedEnum.Keep ? 0 : 1;

			if( nse == ExtraAnimSpeedEnum.Custom )
				extra.AnimSpeed = FloatField(null, extra.AnimSpeed, true, Width(40));
		}

		enum ExtraCameraEnum
		{
			[InspectorName("기존 FOV 유지")] Keep,
			[InspectorName("FOV 지정")] Custom
		}

		void ExtraPointCamera(ref MovePath2.PointExtra extra)
		{
			using var _1 = Horizon();

			ExtraCameraEnum e = extra.FOV == 0 ? ExtraCameraEnum.Keep : ExtraCameraEnum.Custom;

			var ne = EnumField("FOV", e, MinWidth(200));

			extra.FOV = ne switch
			{
				ExtraCameraEnum.Keep => 0,
				ExtraCameraEnum.Custom => FloatField("FOV", extra.FOV),
				_ => 0
			};

			if( e != ne && ne == ExtraCameraEnum.Custom )
				extra.FOV = 60;

			extra.FOVLerp = ne switch
			{
				ExtraCameraEnum.Keep => -1,
				ExtraCameraEnum.Custom => FloatField("Lerp Duration", extra.FOVLerp, options: Width(180)),
				_ => 0
			};

			if( ne != ExtraCameraEnum.Keep )
				extra.FOVLerp = LMath.Max(0, extra.FOVLerp);
		}

		void ExtraPointBarista(ref MovePath2.PointExtra extra, int index, int extraIndex)
		{
			int barNodeCount = extra.BaristaNodes?.Count ?? 0;
			using( Horizon() )
			{
				EditorGUILayout.PrefixLabel($"Barista Node #{barNodeCount}");

				if( Button(Resources.Rect2Icon, 30, 18) )
				{
					OpenBaristaGraphEditor(index, extraIndex);
				}

				Space(10);

				using( Enable(barNodeCount > 0) )
				{
					if( Button(Resources.CrossIcon, 30, 18) )
					{
						extra.BaristaName = "";
						extra.BaristaNodes = new List<BaristaNode>();
						extra.BaristaConnections = new List<BaristaGraphConnection>();
					}
				}
			}
		}

		bool mZTest;
		bool mShowIndex;
		bool mShowDir = true;
		float mGroundTestHeight = 30f;

		static Texture2D mTriangleTexture;

		void ToolGUI()
		{
			using var _1 = Group("Tools");

			using( Horizon() )
			{
				if( Button(ImgText(Resources.CopyIcon, "Copy")) )
				{
					CopyPath = new MovePath2(mMovePath);
				}

				if( Button(ImgText(Resources.PasteIcon, "Paste")) )
				{
					if( CopyPath != null )
					{
						mMovePath.Points = CopyPath.Points.ToArray();
						mMovePath.Extras = CopyPath.Extras.ToArray();
						mMovePath.TotalLength = CopyPath.TotalLength;
						mMovePath.Flags = CopyPath.Flags;

						SetChanged();
					}
				}

				if( Button("Select All") )
				{
					mSelected.Clear();
					for( int i = 0; i < PointCount; i++ )
						mSelected.Add(i);
				}

				if( Button("Deselect All") )
				{
					mSelected.Clear();
					SetChanged();
				}

				if( Button("Delete Selected") )
				{
					foreach( var i in mSelected.OrderByDescending(x => x) )
					{
						DeletePoint(i);
					}

					mSelected.Clear();
				}
			}

			using( Horizon() )
			{
				using( Enable(IsFlyingPath == false) )
				{
					if( Button("Set On Ground") )
					{
						SetOnGround();
					}
				}

				using( Enable(IsSmooth) )
				{
					if( Button("Auto Tangent All") )
					{
						for( int i = 0; i < PointCount; i++ )
							AutoTangent(i);

						SetChanged();
					}
				}

				if( Button("Auto Rotation All") )
				{
					for( int i = 0; i < PointCount; i++ )
						AutoRotation(i);

					SetChanged();
				}

				if( Button("Reverse") )
				{
					mMovePath.Points = mMovePath.Points.Reverse().ToArray();
					SetChanged();
				}

				if( Button("Reset") )
				{
					ResetPoints();
				}
			}

			using( Horizon() )
			{
				if( mGroundTestHeight == 0f )
					mGroundTestHeight = 30f;

				using( LabelWidth(120) )
					mGroundTestHeight = FloatField("바닥 찾기 시작 높이", mGroundTestHeight);

				Space(15);

				mZTest = BoolField("선분 가려지기", mZTest, true, Width(100));
				Space(10);

				mShowIndex = BoolField("포인트 번호 표시", mShowIndex, true, Width(120));
				Space(10);

				mShowDir = BoolField("경로 방향 표시", mShowDir, true, Width(100));
				Space(10);

				FlexibleSpace();

				if( Button("Paste MovePath Points") )
				{
					MovePath2 copyPath = TempCopyPasteMovePath.ConvertPath();
					mMovePath.Points = copyPath.Points.ToArray();
					mMovePath.Extras = copyPath.Extras.ToArray();
					mMovePath.TotalLength = GenerateLineSegments();
					mMovePath.Flags = copyPath.Flags;

					SetChanged();
				}
			}
		}

		float mTestTime = 0;
		MovePathFollower2 mTestPathFollower;

		void TesterGUI()
		{
			using var _1 = Group("Move Path 테스트");

			if( IsRelative )
			{
				HelpBox("Relative 모드에서는 테스트 할 수 없습니다.", MessageType.Warning, true);
			}

			using var _2 = Enable(IsRelative == false);

			using( Horizon() )
			{
				if( Button(ImgText(Resources.PlusIcon, "현재 위치 추가", "게임 객체의 현재 위치, 방향으로 포인트를 추가합니다")) )
				{
					AddGameObjectPoint();
				}

				if( Button("원래 위치로 이동", 110, 26) )
				{
					mTm.position = mInitPos;
					mTm.rotation = mInitRot;

					mTestTime = 0;
				}
			}

			Space(4);

			using( Horizon() )
			{
				HorzLabel("Test Time");

				BeginChange();
				mTestTime = FloatSliderOnly(mTestTime, 0, 1);

				if( IsChanged() )
				{
					TestMove(mTestTime);
				}
			}

			Space(4);
		}

		void TestMove(float time)
		{
			if( mTestPathFollower == null )
				mTestPathFollower = new MovePathFollower2(mMovePath);

			MovePath2.Point testPoint = mTestPathFollower.DevTestPath(time);

			mTm.position = testPoint.Pts;
			mTm.rotation = testPoint.Quat;
		}


		//==========================================================
		// HandleScene
		//==========================================================
		public override void HandleScene()
		{
			if( PointCount == 0 )
				return;

			using var _1 = UndoScope(mProperty.mTarget, "MovePath Edit", Repaint);
			using var _2 = HandleEditable(mProperty.IsEditable);

			using var _3 = IsRelative ? MatrixScope(mTm) : MatrixScope(Matrix4x4.identity);

			BeginChange();

			DrawLines();
			DrawDirection();
			DrawDots();

			// 탄젠트를 바꾸면 Segment 개수가 바뀌면서 위젯들의 control id가 다 바뀐다.
			// 아래 cuts가 segment 개수에 영향을 받기 때문에 일단 tangent를 cuts 보다 먼저 실행한다.
			// control-id를 잘 처리할 수 있는 방법을 찾아야 하는데...모르겠다.
			DrawTangent();
			DrawCuts();

			if( IsChanged() )
			{
				ApplyData();
			}

			if( IsHandleEditable )
				HandleSceneUtility.DoRectSelection(mMovePath.Points.Select(x => x.Pts), mSelected);
		}

		void DrawLines()
		{
			using var _1 = ZTest(mZTest ? UnityEngine.Rendering.CompareFunction.LessEqual : UnityEngine.Rendering.CompareFunction.Always);

			DrawThickPolylines(mLineSegments, mWidget.LineColor, LineThick, false);
		}

		void DrawCuts()
		{
			bool cutMode = Event.current.shift && IsHandleEditable;
			if( cutMode )
			{
				HandleSceneUtility.DrawCuts(mLineSegments, false, this.LineThick, (idx, cutPoint) =>
				{
					int index = mSegIndices[idx];

					InsertPoint(index, Floor(cutPoint));
				});
			}
		}

		void DrawDots()
		{
			LVector3 editMove = LVector3.Zero;
			bool deleteMode = Event.current.control && IsHandleEditable;
			bool editable = !deleteMode && Event.current.shift == false && IsHandleEditable;       // shift 눌러서 탄젠트나 로테이션 바꿀 때는 위치 이동 안되게 막음

			int deleteIndex = -1;

			for( int i = 0, count = PointCount; i < count; i++ )
			{
				int index = i;
				LVector3 pts = Point(i).Pts;

				bool selected = mSelected.Contains(i);
				if( selected )
				{
					DrawSolidCircle2(pts, DotSize * 1.2f, new Color(1, 0, 0, 0.2f));
				}

				bool extra = FindPointExtra(i) != -1;
				if( extra )
				{
					DrawSolidCircle2(pts, DotSize * 0.7f, Color.blue.WithAlpha(0.7f));
				}

				if( deleteMode )
				{
					bool click = SphereButtonHandle()
									.WithWidget(HandleWidgetRect.Inst)
									.WithHandleColor(Color.Lerp(mWidget.DotColor, Color.black, 0.2f))
									.WithHoverColor(Color.magenta)
									.WithWidgetHoverScale(1.5f)
									.Do(pts, DotSize);
					if( click )
						deleteIndex = index;
				}
				else if( editable )
				{
					BeginChange();

					LVector3 nextPts;

					if( IsFlyingPath )
					{
						nextPts = Slider2DHandle()
									.WithButtonDown(() => DotClick(index))
									.WithHandleColor(mWidget.DotColor)
									.WithHoverColor(Color.white)
									.WithRightClick(() => DotRightClick(index))
									.WithDragSnap(4)
									.Do(pts, Vector3.right, Vector3.forward, DotSize);
					}
					else
					{
						nextPts = ProjectMoveHandle()
									.WithButtonDown(() => DotClick(index))
									.WithHandleColor(mWidget.DotColor)
									.WithHoverColor(Color.white)
									.WithRightClick(() => DotRightClick(index))
									.WithDragSnap(4)
									.Do(pts, DotSize, (pos, ray) =>
									{
										return TestRaycast(ray.origin, ray.direction, 1000, out var hit) ? Handles.inverseMatrix.MultiplyPoint3x4(hit.GetHitPoint(ray)) : pos;
									});
					}

					if( IsChanged() )
					{
						editMove += (nextPts - pts).SetY(0);
						mSelected.Add(index);
					}
				}
				else
				{
					DrawSolidCircle2(pts, DotSize * 0.5f, mWidget.DotColor.value.WithAlpha(0.7f), LVector3.YAxis);
				}

				if( IsFlyingPath && deleteMode == false )
				{
					BeginChange();
					LVector3 nextPts = Slider1DHandle()
										.WithHandleColor(Handles.yAxisColor)
										.WithButtonDown(() => DotClick(index))
										.WithRelativeMove()
										.Do(pts, Vector3.up, DotSize * 2);

					if( IsChanged() )
					{
						editMove.Y += (nextPts - pts).Y;
						mSelected.Add(index);
					}

					LVector3 floorPt = FlyingPathFloor(pts);

					if( floorPt.Y - pts.Y < -0.1f )
					{
						DrawThickLine(pts, floorPt, new Color(0, 0.5f, 1, 0.5f), LineThick / 2f);
					}
					else if( floorPt.Y - pts.Y > 0.1f )
					{
						DrawThickLine(pts, floorPt, new Color(1, 0.3f, 0.3f, 0.5f), LineThick / 2f);
					}
				}
			}

			if( editMove.IsNonZero )
			{
				SetChanged();

				// 드래그하면 선택된 모든 점들을 동시에 움직인다.
				foreach( int s in mSelected )
				{
					ref var p = ref Point(s);
					p.Pts = Floor(p.Pts + editMove);
				}
			}

			// Direction Arrow
			if( mShowDir )
			{
				if( mTriangleTexture == null )
					mTriangleTexture = UnityEngine.Resources.Load<Texture2D>("movepath_triangle");

				for( int i = 0, count = PointCount; i < count; i++ )
				{
					int index = mPtsToSegIndices[i];
					LVector3 pos = mLineSegments[index];
					LVector3 prev = index == 0 ? (IsLoop ? mLineSegments.Last() : pos) : mLineSegments[index - 1];
					LVector3 next = index == mLineSegments.Count - 1 ? (IsLoop ? mLineSegments[0] : pos) : mLineSegments[index + 1];

					LVector3 dir = IsSmooth ? (next - prev).X0Z : (next - pos).X0Z;

					DrawTexture(pos, mWidget.DotSize * 0.6f, mWidget.DotSize * 0.8f, mTriangleTexture, mWidget.LineColor, dir, LVector3.YAxis);

				}
			}

			if( mShowIndex )
			{
				for( int i = 0, count = PointCount; i < count; i++ )
				{
					DrawSceneLabel(Point(i).Pts, $"{i + 1}", Color.black, 12);
				}
			}

			if( deleteIndex != -1 )
				DeletePoint(deleteIndex);
		}


		void DotClick(int index)
		{
			if( Event.current.alt )     // Ctrl이면 선택 추가
			{
				if( mSelected.Contains(index) )
					mSelected.Remove(index);
				else
					mSelected.Add(index);
			}
			else
			{
				if( mSelected.Contains(index) == false )
					mSelected.Clear();

				mSelected.Add(index);
			}

			// 스크롤이 되도록 한다.
			mEnsureSelectScroll = true;

			Repaint();
		}

		void DotRightClick(int index)
		{
			var menu = new GenericMenu();

			menu.AddItem(new GUIContent("추가"), false, () => InsertPoint(index, null, true));
			menu.AddItem(new GUIContent("앞에 추가"), false, () => InsertPoint(index - 1, null, true));
			menu.AddSeparator("");
			menu.AddItem(new GUIContent("삭제"), false, () => DeletePoint(index, true));

			//if( IsRotational )
			//	menu.AddItem(new GUIContent("방향 자동설정"), false, () => ResetRotation(index));

			menu.ShowAsContext();
		}

		void DrawTangent()
		{
			bool tangentMode = Event.current.shift && IsHandleEditable && IsSmooth;
			if( tangentMode == false )
				return;

			const float TangentScale = 3;

			for( int i = 0, count = PointCount; i < count; i++ )
			{
				ref var p = ref Point(i);

				BeginChange();

				LVector3 handle = p.Pts + p.Tangent / TangentScale;
				LVector3 pts = p.Pts;

				//LDebug.Log($"{Event.current.type} - {Event.current.keyCode}");

				handle = Slider2DHandle()
							.WithHandleColor(TangentColor.value).WithHoverColor(Color.red).WithDragColor(Color.red)
							.WithWidget(HandleWidgetDot.Inst)
							.WithDecorateDrawer((h, pos, r, s, v, d) => OnDrawDashLine(h, pos, r, s, v, d, pts))
							.WithPickPriority(1)
							.Do(handle, LVector3.XAxis, LVector3.ZAxis, DotSize / 3);

				if( !IsFlyingPath )
				{
					if( handle.Y != p.Pts.Y )
					{
						handle = handle.SetY(p.Pts.Y);
						SetChanged();
					}
				}
				if( IsChanged() )
				{
					p.Tangent = (handle - p.Pts) * TangentScale;
				}

				if( IsFlyingPath )
				{
					BeginChange();
					handle = Slider1DHandle()
								.WithHandleColor(Handles.yAxisColor)
								.WithRelativeMove()
								.Do(handle, Vector3.up, DotSize * 2);

					if( IsChanged() )
					{
						p.Tangent = (handle - p.Pts) * TangentScale;
					}
				}
			}

			void OnDrawDashLine(HandleBase handler, LVector3 position, Quaternion rotation, float size, bool hover, bool dragging, LVector3 pivot)
			{
				using( ColorScope(TangentColor) )
				{
					Handles.DrawDottedLine(pivot, position, 2);
				}
			}
		}

		void DrawDirection()
		{
			if( IsDirectional == false || mShowDirWidget == false )
				return;

			bool up = Event.current.shift;

			var arrowWidget = new HandleWidgetArrow(0.2f, 1.0f, DotSize * mDirWidgetLen);

			for( int i = 0, count = PointCount; i < count; i++ )
			{
				int index = i;
				ref var p = ref Point(i);
				LVector3 pts = p.Pts;

				Quaternion rot = p.Quat;
				LVector3 zAxis = rot * LVector3.ZAxis;
				LVector3 xAxis = rot * LVector3.XAxis;
				LVector3 yAxis = rot * LVector3.YAxis;

				LVector3 dotPos = pts + zAxis * DotSize * mDirWidgetLen;

				BeginChange();

				dotPos = SliderRotHandle()
								.WithWidget(arrowWidget)
								.WithHandleColor(DirColor)
								.WithRotateLine(up ? Color.green : Color.yellow)
								.Do(pts, dotPos, up ? xAxis : yAxis, DotSize * mDirWidgetLen);

				if( IsChanged() )
				{
					zAxis = (dotPos - pts).Normal;

					if( up )
						yAxis = zAxis.Cross(xAxis).Normal;

					if( mFreezeRoll )
						p.Quat = Quaternion.LookRotation(zAxis, LVector3.YAxis);
					else
						p.Quat = Quaternion.LookRotation(zAxis, yAxis);
				}
			}
		}

		bool TestRaycast(LVector3 origin, LVector3 direction, float distance, out RayHitInfo hitInfo)
		{
			return Raycaster.Cast(origin, direction, distance, out hitInfo);
		}



		//==========================================================
		// Tools
		//==========================================================
		void ResetPoints()
		{
			// Scene 뷰의 가운데에 생성한다.
			Camera cam = SceneView.lastActiveSceneView.camera;
			var ray = cam.ViewportPointToRay(new Vector3(0.5f, 0.5f, 0));
			var hitInfo = Raycaster.Cast(ray.origin, ray.direction, 1000);
			LVector3 worldPos = hitInfo.Hit ? (ray.origin + ray.direction * hitInfo.Distance) : LVector3.Zero;
			LVector3 basePos = IsRelative && mTm != null ? mTm.InverseTransformPoint(worldPos) : worldPos;

			const float SIZE = 2;
			mMovePath.Points = new MovePath2.Point[]
			{
				NewPoint(basePos.Add(0, 0, 0)),
				NewPoint(basePos.Add(0, 0, SIZE)),
				NewPoint(basePos.Add(SIZE, 0, SIZE))
			};

			AutoTangent(0);
			AutoTangent(1);
			AutoTangent(2);

			SetChanged();
		}

		void SetOnGround()
		{
			for( int i = 0; i < PointCount; i++ )
			{
				ref var p = ref Point(i);
				p.Pts = Floor(p.Pts);
			}

			SetChanged();
		}

		LVector3 WorldPos(LVector3 pt)
		{
			return IsRelative ? mTm.TransformPoint(pt) : pt;
		}

		LVector3 Floor(LVector3 pt)
		{
			//const float FindHeight = 30;

			if( IsFlyingPath )
				return pt;

			LVector3 worldPt = WorldPos(pt);


			var hit = Raycaster.Cast(worldPt.AddY(mGroundTestHeight), LVector3.DownDir, mGroundTestHeight * 2, LayerNames.MoveMask);
			if( hit.Hit )
			{
				return pt.AddY(mGroundTestHeight - hit.Distance);
			}

			return pt;
		}

		LVector3 FlyingPathFloor(LVector3 pt)
		{
			const float FindHeight = 10f;
			RayHitInfo botHitInfo = Raycaster.Cast(pt, LVector3.DownDir, FindHeight, LayerNames.MoveMask);
			if( botHitInfo.Hit )
			{
				pt = pt.AddY(-botHitInfo.Distance);
			}
			else // 아래로 땅이 없을시 위로 땅이 있는지 체크
			{
				RayHitInfo topHitInfo = Raycaster.Cast(pt, LVector3.YAxis, FindHeight, LayerNames.MoveMask);
				if( topHitInfo.Hit )
				{
					pt = pt.AddY(topHitInfo.Distance);
				}
				else // Terrain은 1-sided이기 때문에 위에서 아래로 한번 더 체크.
				{
					if( TerrainCollision.Raycast(pt.AddY(FindHeight), LVector3.DownDir, FindHeight, out TerrainHitInfo topTerrainHitInfo, LayerNames.MoveMask) )
					{
						pt = topTerrainHitInfo.Position;
					}
				}
			}

			return pt;
		}

		void OpenBaristaGraphEditor(int pointIndex, int extraIndex)
		{
			ref var extra = ref mMovePath.Extras[extraIndex];

			BaristaGraphData data = new BaristaGraphData();
			if( extra.BaristaNodes == null || extra.BaristaNodes.Count == 0 )
			{
				data.Name = mTm.gameObject.name + "_" + (pointIndex + 1);
				data.Desc = $"{mTm.gameObject.name}의 #{pointIndex + 1}번째 점 바리스타 그래프";
			}
			else
			{
				data.Name = extra.BaristaName;
				data.Desc = extra.BaristaDescription;
				data.Nodes = extra.BaristaNodes;
				data.Connections = extra.BaristaConnections;
			}

			BaristaGraphEditor.Open(data, ApplyBaristaGraph);

			void ApplyBaristaGraph(BaristaGraphData d)
			{
				ref var extra = ref mMovePath.Extras[extraIndex];
				if( extra.PointIndex == pointIndex )
				{
					extra.BaristaName = d.Name;
					extra.BaristaDescription = d.Desc;
					extra.BaristaNodes = d.Nodes;
					extra.BaristaConnections = d.Connections;
					ApplyData();
				}
			}
		}

		float GenerateLineSegments()
		{
			const float FragLength = 0.1f;      // 0.1m단위로 쪼갠다.

			float totalLength = 0;

			mLineSegments.Clear();
			mSegIndices.Clear();
			mPtsToSegIndices.Clear();

			var pathFollower = new MovePathFollower2(mMovePath);
			var segment = new HermiteSegment2(MovePathFollower2.SegmentDivisions);

			mLineSegments.Add(Floor(Point(0).Pts));
			mSegIndices.Add(0);
			mPtsToSegIndices.Add(0);

			int segmentCount = mMovePath.Points.Length - (IsLoop ? 0 : 1);

			for( int i = 0; i < segmentCount; i++ )
			{
				pathFollower.Editor_FetchSegment(i, segment);

				totalLength += segment.SegmentLength;

				while( true )
				{
					float ds = FragLength;
					(LVector3 pos, _) = segment.Advance(ref ds, out bool end, out _);

					mLineSegments.Add(Floor(pos));
					mSegIndices.Add(i);

					if( end )
						break;
				}

				mPtsToSegIndices.Add(mLineSegments.Count - 1);
			}

			return totalLength;
		}

		void ChangeRelative(bool relative)
		{
			if( mTm == null )
				return;

			Quaternion Q = mTm.rotation;
			Quaternion invQ = Quaternion.Inverse(Q);

			for( int i = 0; i < PointCount; i++ )
			{
				ref var p = ref Point(i);
				if( relative )
				{
					// world==>local
					p.Pts = mTm.InverseTransformPoint(p.Pts);
					p.Tangent = mTm.InverseTransformVector(p.Tangent);
					p.Quat = invQ * p.Quat;
				}
				else
				{
					// local==>world
					p.Pts = mTm.TransformPoint(p.Pts);
					p.Tangent = mTm.TransformVector(p.Tangent);
					p.Quat = Q * p.Quat;
				}
			}
		}
	}
}
