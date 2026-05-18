using System;
using System.Collections;
using System.Collections.Generic;
using LmgLib;
using LmgLib.Unity;
using UnityEngine;

#if UNITY_EDITOR
using static LmgLib.Unity.LSolidEditor;
#endif

namespace Puppy
{

	public class BaristaAction_TextUI : BaristaActionBase
	{
		const string MenuPath = BAC.UI + "텍스트 패널 생성&제거";

		public enum TextUIType
		{
			[InspectorName("텍스트 생성")]
			Create,
			[InspectorName("텍스트 제거")]
			Close,
		}

		[Serializable]
		public class Data
		{
			public TextUIType Type;
			public LVector2 TextPanelPosition;
			public Color TextColor;
			public float TextSize = 30;
			public string Text;
		}

		Data mData;
		TextPanelUI mUI;

		public override bool IsFinished => true;

		public override void Init(string jsonData)
		{
			mData = LJson.FromJson<Data>(jsonData);
		}

		public override void OnStart()
		{
			if( mData.Type == TextUIType.Create )
			{
				mUI = UIComponentBehaviour.Create<TextPanelUI>().Init(mData.Text, mData.TextColor, mData.TextSize);
				mUI.SetPosition(mData.TextPanelPosition);
				mUI.Show();
			}
			else
			{
				mUI = UIComponentBehaviour.GetUI<TextPanelUI>();
				if( mUI != null )
					mUI.Close();
			}
		}

#if UNITY_EDITOR
		public class BaristaAction_TextUI_Editor : BaristaActionNodeEditor<Data>
		{
			public override void HandleGUI()
			{
				Data.Type = EnumField("생성/제거", Data.Type);
				if( Data.Type == TextUIType.Close )
					return;
				Data.TextPanelPosition = Vector2Field("UI 위치", Data.TextPanelPosition, "X 좌표:", "Y 좌표");
				TooltipLine("(0, 0)이 화면 중앙입니다.");
				Data.TextColor = ColorField("색상", Data.TextColor);
				Data.TextSize = FloatField("텍스트 크기", Data.TextSize);
				Data.Text = TextAreaField("텍스트", Data.Text);
			}
		}
#endif
	}
}
