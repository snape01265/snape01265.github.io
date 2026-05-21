using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using LmgLib;
using LmgLib.Wine;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.Controls;

namespace Puppy
{
	[Serializable]
	public struct OmniInput
	{
		public OmniKey Key;	// 키보드 입력
		public OmniKey Pad;	// 게임패드 입력

		public OmniInput(OmniKey keyAndMouse, OmniKey gamepad)
		{
			Key = keyAndMouse;
			Pad = gamepad;
		}

		public static OmniInput None => new OmniInput(OmniKey.None, OmniKey.None);

		public bool HasKey(OmniKey key)
		{
			OmniKey normalizedKey = OmniKeyMapper.Normalize(key);
			return OmniKeyMapper.Normalize(Key) == normalizedKey || OmniKeyMapper.Normalize(Pad) == normalizedKey;
		}

		public bool IsEmpty()
		{
			return Key == OmniKey.None && Pad == OmniKey.None;
		}

		public bool IsValid()
		{
			return Key != OmniKey.None || Pad != OmniKey.None;
		}

		public static bool operator ==(OmniInput a, OmniInput b)
		{
			return a.Key == b.Key && a.Pad == b.Pad;
		}

		public static bool operator !=(OmniInput a, OmniInput b)
		{
			return !(a == b);
		}
	}

	public enum OmniKey
	{
		None = 0,

		// ==========================
		// 키보드 키
		// ==========================

		Key_A, Key_B, Key_C, Key_D, Key_E, Key_F, Key_G, Key_H, Key_I, Key_J,
		Key_K, Key_L, Key_M, Key_N, Key_O, Key_P, Key_Q, Key_R, Key_S, Key_T,
		Key_U, Key_V, Key_W, Key_X, Key_Y, Key_Z, 

		Key_F1, Key_F2, Key_F3, Key_F4, Key_F5, Key_F6, Key_F7, Key_F8, Key_F9, Key_F10, Key_F11, Key_F12,

		Key_Digit0, Key_Digit1, Key_Digit2, Key_Digit3, Key_Digit4,
		Key_Digit5, Key_Digit6, Key_Digit7, Key_Digit8, Key_Digit9,

		Key_Numpad0, Key_Numpad1, Key_Numpad2, Key_Numpad3, Key_Numpad4,
		Key_Numpad5, Key_Numpad6, Key_Numpad7, Key_Numpad8, Key_Numpad9,

		Key_Space, Key_Enter, Key_Escape, Key_Tab, Key_Backspace, Key_CapsLock,
		Key_Insert, Key_Delete, Key_Home, Key_End, Key_PageUp, Key_PageDown,

		Key_LeftShift, Key_RightShift,
		Key_LeftCtrl, Key_RightCtrl,
		Key_LeftAlt, Key_RightAlt,

		Key_ArrowUp, Key_ArrowDown, Key_ArrowLeft, Key_ArrowRight,

		Key_Minus, Key_Equals, Key_Backquote, Key_Quote, Key_Semicolon,
		Key_Comma, Key_Period, Key_Slash, Key_Backslash,
		Key_LeftBracket, Key_RightBracket,

		// ==========================
		// 마우스
		// ==========================

		Mouse_Left,
		Mouse_Right,
		Mouse_Middle,
		Mouse_Move,

		// ==========================
		// 게임패드 버튼
		// ==========================

								// Xbox    PS		
		Gamepad_ButtonNorth,    //  Y	| 세모
		Gamepad_ButtonSouth,    //  A	| 엑스
		Gamepad_ButtonEast,     //  B	| 동그라미
		Gamepad_ButtonWest,		//  X	| 네모

		Gamepad_LB,				// Left Shoulder
		Gamepad_RB,				// Right Shoulder
		Gamepad_LT,				// Left Trigger
		Gamepad_RT,				// Right Trigger

		Gamepad_LStick,
		Gamepad_LStick_Vertical,
		Gamepad_LStick_Horizontal,
		Gamepad_LStick_Up,
		Gamepad_LStick_Down,
		Gamepad_LStick_Left,
		Gamepad_LStick_Right,

		Gamepad_RStick,
		Gamepad_RStick_Vertical,
		Gamepad_RStick_Horizontal,
		Gamepad_RStick_Up,
		Gamepad_RStick_Down,
		Gamepad_RStick_Left,
		Gamepad_RStick_Right,

		Gamepad_LStick_Press,	// L3
		Gamepad_RStick_Press,	// R3

		Gamepad_Start,
		Gamepad_Select,

		Gamepad_DPad,
		Gamepad_DPad_Vertical,
		Gamepad_DPad_Horizontal,
		Gamepad_DPad_Up,
		Gamepad_DPad_Down,
		Gamepad_DPad_Left,
		Gamepad_DPad_Right,
	}

	public static class OmniKeyMapper
	{
		public static ButtonControl ButtonControl(OmniKey key)
		{
			if( key == OmniKey.None )
				return null;

			// ---------- 키보드 ----------
			if( OmniKey.Key_A <= key && key <= OmniKey.Key_RightBracket && Keyboard.current != null )
			{
				Key unityKey = MapToUnityKey(key);
				return unityKey != Key.None ? Keyboard.current[unityKey] : null;
			}

			// ---------- 마우스 ----------
			if( OmniKey.Mouse_Left <= key && key <= OmniKey.Mouse_Move && Mouse.current != null )
			{
				switch( key )
				{
					case OmniKey.Mouse_Left: return Mouse.current.leftButton;
					case OmniKey.Mouse_Right: return Mouse.current.rightButton;
					case OmniKey.Mouse_Middle: return Mouse.current.middleButton;
				}
			}

			// --------- 게임패드 ---------
			var gp = Gamepad.current;
			if( OmniKey.Gamepad_ButtonNorth <= key && key <= OmniKey.Gamepad_DPad_Right && gp != null )
			{
				return GetButtonControlFromGamepad(gp, key);
			}

			return null;
		}

		public static Vector2Control StickControl(OmniKey key)
		{
			if( Mouse.current != null )
			{
				if( key == OmniKey.Mouse_Move )
					return Mouse.current.delta;
			}

			var gp = Gamepad.current;
			if( gp == null )
				return null;

			return key switch
			{
				OmniKey.Gamepad_LStick => gp.leftStick,
				OmniKey.Gamepad_RStick => gp.rightStick,
				OmniKey.Gamepad_DPad => gp.dpad,
				_ => null
			};
		}

		// 모든 게임패드의 스틱 값을 합산하여 반환
		public static Vector2 GetCombinedStickValue(OmniKey key)
		{
			Vector2 combinedValue = Vector2.zero;

			if( Gamepad.all.Count == 0 )
				return Vector2.zero;

			// 모든 게임패드의 입력을 합산
			foreach( var gp in Gamepad.all )
			{
				if( gp == null )
					continue;

				Vector2 stickValue = key switch
				{
					OmniKey.Gamepad_LStick => gp.leftStick.ReadValue(),
					OmniKey.Gamepad_RStick => gp.rightStick.ReadValue(),
					OmniKey.Gamepad_DPad => gp.dpad.ReadValue(),
					_ => Vector2.zero
				};

				combinedValue += stickValue;
			}

			return Vector2.ClampMagnitude(combinedValue, 1f);
		}

		// 모든 게임패드의 버튼 입력을 합산하여 반환 (하나라도 눌려있으면 true)
		public static bool GetCombinedButtonPressed(OmniKey key)
		{
			if( Gamepad.all.Count == 0 )
				return false;

			// 모든 게임패드를 순회하며 하나라도 눌려있으면 true
			foreach( var gp in Gamepad.all )
			{
				if( gp == null )
					continue;

				ButtonControl button = GetButtonControlFromGamepad(gp, key);
				if( button != null && button.isPressed )
					return true;
			}

			return false;
		}

		// 모든 게임패드의 버튼 상태를 합산하여 InputButtonState로 반환
		public static InputButtonState GetCombinedButtonState(OmniKey key)
		{
			var combinedState = new InputButtonState();

			if( Gamepad.all.Count == 0 )
				return combinedState;

			// 모든 게임패드를 순회하며 OR 연산으로 합산
			foreach( var gp in Gamepad.all )
			{
				if( gp == null )
					continue;

				ButtonControl button = GetButtonControlFromGamepad(gp, key);
				if( button != null )
				{
					var state = new InputButtonState
					{
						IsPressed = button.wasPressedThisFrame,
						IsReleased = button.wasReleasedThisFrame,
						PressState = button.isPressed
					};

					combinedState |= state;
				}
			}

			return combinedState;
		}

		// 특정 게임패드에서 OmniKey에 해당하는 ButtonControl을 가져옴
		private static ButtonControl GetButtonControlFromGamepad(Gamepad gp, OmniKey key)
		{
			return key switch
			{
				OmniKey.Gamepad_ButtonSouth => gp.buttonSouth,
				OmniKey.Gamepad_ButtonNorth => gp.buttonNorth,
				OmniKey.Gamepad_ButtonEast => gp.buttonEast,
				OmniKey.Gamepad_ButtonWest => gp.buttonWest,

				OmniKey.Gamepad_LB => gp.leftShoulder,
				OmniKey.Gamepad_RB => gp.rightShoulder,
				OmniKey.Gamepad_LT => gp.leftTrigger,
				OmniKey.Gamepad_RT => gp.rightTrigger,

				OmniKey.Gamepad_LStick_Press => gp.leftStickButton,
				OmniKey.Gamepad_RStick_Press => gp.rightStickButton,

				OmniKey.Gamepad_Start => gp.startButton,
				OmniKey.Gamepad_Select => gp.selectButton,

				OmniKey.Gamepad_DPad_Up => gp.dpad.up,
				OmniKey.Gamepad_DPad_Down => gp.dpad.down,
				OmniKey.Gamepad_DPad_Left => gp.dpad.left,
				OmniKey.Gamepad_DPad_Right => gp.dpad.right,

				OmniKey.Gamepad_LStick_Up => gp.leftStick.up,
				OmniKey.Gamepad_LStick_Down => gp.leftStick.down,
				OmniKey.Gamepad_LStick_Left => gp.leftStick.left,
				OmniKey.Gamepad_LStick_Right => gp.leftStick.right,

				OmniKey.Gamepad_RStick_Up => gp.rightStick.up,
				OmniKey.Gamepad_RStick_Down => gp.rightStick.down,
				OmniKey.Gamepad_RStick_Left => gp.rightStick.left,
				OmniKey.Gamepad_RStick_Right => gp.rightStick.right,

				_ => null
			};
		}

		public static AxisControl AxisControl(OmniKey key)
		{
			var gp = Gamepad.current;
			if( gp == null )
				return null;
			return key switch
			{
				OmniKey.Gamepad_LStick_Vertical => gp.leftStick.y,
				OmniKey.Gamepad_LStick_Horizontal => gp.leftStick.x,
				OmniKey.Gamepad_RStick_Vertical => gp.rightStick.y,
				OmniKey.Gamepad_RStick_Horizontal => gp.rightStick.x,
				OmniKey.Gamepad_DPad_Vertical => gp.dpad.y,
				OmniKey.Gamepad_DPad_Horizontal => gp.dpad.x,
				_ => null
			};
		}

		public static OmniKey Normalize(OmniKey key)
		{
			switch( key )
			{
				case OmniKey.Key_RightShift:	return OmniKey.Key_LeftShift;
				case OmniKey.Key_RightAlt:		return OmniKey.Key_LeftAlt;
				case OmniKey.Key_RightCtrl:		return OmniKey.Key_LeftCtrl;

				case OmniKey.Key_Numpad0:		return OmniKey.Key_Digit0;
				case OmniKey.Key_Numpad1:		return OmniKey.Key_Digit1;
				case OmniKey.Key_Numpad2:		return OmniKey.Key_Digit2;
				case OmniKey.Key_Numpad3:		return OmniKey.Key_Digit3;
				case OmniKey.Key_Numpad4:		return OmniKey.Key_Digit4;
				case OmniKey.Key_Numpad5:		return OmniKey.Key_Digit5;
				case OmniKey.Key_Numpad6:		return OmniKey.Key_Digit6;
				case OmniKey.Key_Numpad7:		return OmniKey.Key_Digit7;
				case OmniKey.Key_Numpad8:		return OmniKey.Key_Digit8;
				case OmniKey.Key_Numpad9:		return OmniKey.Key_Digit9;

				default:						return key;
			}
		}

		public static Key MapToUnityKey(OmniKey key)
		{
			return key switch
			{
				OmniKey.Key_A => Key.A,
				OmniKey.Key_B => Key.B,
				OmniKey.Key_C => Key.C,
				OmniKey.Key_D => Key.D,
				OmniKey.Key_E => Key.E,
				OmniKey.Key_F => Key.F,
				OmniKey.Key_G => Key.G,
				OmniKey.Key_H => Key.H,
				OmniKey.Key_I => Key.I,
				OmniKey.Key_J => Key.J,
				OmniKey.Key_K => Key.K,
				OmniKey.Key_L => Key.L,
				OmniKey.Key_M => Key.M,
				OmniKey.Key_N => Key.N,
				OmniKey.Key_O => Key.O,
				OmniKey.Key_P => Key.P,
				OmniKey.Key_Q => Key.Q,
				OmniKey.Key_R => Key.R,
				OmniKey.Key_S => Key.S,
				OmniKey.Key_T => Key.T,
				OmniKey.Key_U => Key.U,
				OmniKey.Key_V => Key.V,
				OmniKey.Key_W => Key.W,
				OmniKey.Key_X => Key.X,
				OmniKey.Key_Y => Key.Y,
				OmniKey.Key_Z => Key.Z,

				OmniKey.Key_Digit0 => Key.Digit0,
				OmniKey.Key_Digit1 => Key.Digit1,
				OmniKey.Key_Digit2 => Key.Digit2,
				OmniKey.Key_Digit3 => Key.Digit3,
				OmniKey.Key_Digit4 => Key.Digit4,
				OmniKey.Key_Digit5 => Key.Digit5,
				OmniKey.Key_Digit6 => Key.Digit6,
				OmniKey.Key_Digit7 => Key.Digit7,
				OmniKey.Key_Digit8 => Key.Digit8,
				OmniKey.Key_Digit9 => Key.Digit9,

				OmniKey.Key_Numpad0 => Key.Numpad0,
				OmniKey.Key_Numpad1 => Key.Numpad1,
				OmniKey.Key_Numpad2 => Key.Numpad2,
				OmniKey.Key_Numpad3 => Key.Numpad3,
				OmniKey.Key_Numpad4 => Key.Numpad4,
				OmniKey.Key_Numpad5 => Key.Numpad5,
				OmniKey.Key_Numpad6 => Key.Numpad6,
				OmniKey.Key_Numpad7 => Key.Numpad7,
				OmniKey.Key_Numpad8 => Key.Numpad8,
				OmniKey.Key_Numpad9 => Key.Numpad9,

				OmniKey.Key_F1 => Key.F1,
				OmniKey.Key_F2 => Key.F2,
				OmniKey.Key_F3 => Key.F3,
				OmniKey.Key_F4 => Key.F4,
				OmniKey.Key_F5 => Key.F5,
				OmniKey.Key_F6 => Key.F6,
				OmniKey.Key_F7 => Key.F7,
				OmniKey.Key_F8 => Key.F8,
				OmniKey.Key_F9 => Key.F9,
				OmniKey.Key_F10 => Key.F10,
				OmniKey.Key_F11 => Key.F11,
				OmniKey.Key_F12 => Key.F12,

				OmniKey.Key_Space => Key.Space,
				OmniKey.Key_Enter => Key.Enter,
				OmniKey.Key_Escape => Key.Escape,
				OmniKey.Key_Tab => Key.Tab,
				OmniKey.Key_Backspace => Key.Backspace,
				OmniKey.Key_CapsLock => Key.CapsLock,
				OmniKey.Key_Insert => Key.Insert,
				OmniKey.Key_Delete => Key.Delete,
				OmniKey.Key_Home => Key.Home,
				OmniKey.Key_End => Key.End,
				OmniKey.Key_PageUp => Key.PageUp,
				OmniKey.Key_PageDown => Key.PageDown,

				OmniKey.Key_LeftShift => Key.LeftShift,
				OmniKey.Key_RightShift => Key.RightShift,
				OmniKey.Key_LeftCtrl => Key.LeftCtrl,
				OmniKey.Key_RightCtrl => Key.RightCtrl,
				OmniKey.Key_LeftAlt => Key.LeftAlt,
				OmniKey.Key_RightAlt => Key.RightAlt,

				OmniKey.Key_ArrowUp => Key.UpArrow,
				OmniKey.Key_ArrowDown => Key.DownArrow,
				OmniKey.Key_ArrowLeft => Key.LeftArrow,
				OmniKey.Key_ArrowRight => Key.RightArrow,

				OmniKey.Key_Minus => Key.Minus,
				OmniKey.Key_Equals => Key.Equals,
				OmniKey.Key_Backquote => Key.Backquote,
				OmniKey.Key_Quote => Key.Quote,
				OmniKey.Key_Semicolon => Key.Semicolon,
				OmniKey.Key_Comma => Key.Comma,
				OmniKey.Key_Period => Key.Period,
				OmniKey.Key_Slash => Key.Slash,
				OmniKey.Key_Backslash => Key.Backslash,
				OmniKey.Key_LeftBracket => Key.LeftBracket,
				OmniKey.Key_RightBracket => Key.RightBracket,

				_ => Key.None
			};
		}

		public static OmniKey MapToOmniKey(Key key)
		{
			return key switch
			{
				Key.A => OmniKey.Key_A,
				Key.B => OmniKey.Key_B,
				Key.C => OmniKey.Key_C,
				Key.D => OmniKey.Key_D,
				Key.E => OmniKey.Key_E,
				Key.F => OmniKey.Key_F,
				Key.G => OmniKey.Key_G,
				Key.H => OmniKey.Key_H,
				Key.I => OmniKey.Key_I,
				Key.J => OmniKey.Key_J,
				Key.K => OmniKey.Key_K,
				Key.L => OmniKey.Key_L,
				Key.M => OmniKey.Key_M,
				Key.N => OmniKey.Key_N,
				Key.O => OmniKey.Key_O,
				Key.P => OmniKey.Key_P,
				Key.Q => OmniKey.Key_Q,
				Key.R => OmniKey.Key_R,
				Key.S => OmniKey.Key_S,
				Key.T => OmniKey.Key_T,
				Key.U => OmniKey.Key_U,
				Key.V => OmniKey.Key_V,
				Key.W => OmniKey.Key_W,
				Key.X => OmniKey.Key_X,
				Key.Y => OmniKey.Key_Y,
				Key.Z => OmniKey.Key_Z,

				Key.Digit0 => OmniKey.Key_Digit0,
				Key.Digit1 => OmniKey.Key_Digit1,
				Key.Digit2 => OmniKey.Key_Digit2,
				Key.Digit3 => OmniKey.Key_Digit3,
				Key.Digit4 => OmniKey.Key_Digit4,
				Key.Digit5 => OmniKey.Key_Digit5,
				Key.Digit6 => OmniKey.Key_Digit6,
				Key.Digit7 => OmniKey.Key_Digit7,
				Key.Digit8 => OmniKey.Key_Digit8,
				Key.Digit9 => OmniKey.Key_Digit9,

				Key.Numpad0 => OmniKey.Key_Numpad0,
				Key.Numpad1 => OmniKey.Key_Numpad1,
				Key.Numpad2 => OmniKey.Key_Numpad2,
				Key.Numpad3 => OmniKey.Key_Numpad3,
				Key.Numpad4 => OmniKey.Key_Numpad4,
				Key.Numpad5 => OmniKey.Key_Numpad5,
				Key.Numpad6 => OmniKey.Key_Numpad6,
				Key.Numpad7 => OmniKey.Key_Numpad7,
				Key.Numpad8 => OmniKey.Key_Numpad8,
				Key.Numpad9 => OmniKey.Key_Numpad9,

				Key.F1 => OmniKey.Key_F1,
				Key.F2 => OmniKey.Key_F2,
				Key.F3 => OmniKey.Key_F3,
				Key.F4 => OmniKey.Key_F4,
				Key.F5 => OmniKey.Key_F5,
				Key.F6 => OmniKey.Key_F6,
				Key.F7 => OmniKey.Key_F7,
				Key.F8 => OmniKey.Key_F8,
				Key.F9 => OmniKey.Key_F9,
				Key.F10 => OmniKey.Key_F10,
				Key.F11 => OmniKey.Key_F11,
				Key.F12 => OmniKey.Key_F12,

				Key.Space => OmniKey.Key_Space,
				Key.Enter => OmniKey.Key_Enter,
				Key.Escape => OmniKey.Key_Escape,
				Key.Tab => OmniKey.Key_Tab,
				Key.Backspace => OmniKey.Key_Backspace,
				Key.CapsLock => OmniKey.Key_CapsLock,
				Key.Insert => OmniKey.Key_Insert,
				Key.Delete => OmniKey.Key_Delete,
				Key.Home => OmniKey.Key_Home,
				Key.End => OmniKey.Key_End,
				Key.PageUp => OmniKey.Key_PageUp,
				Key.PageDown => OmniKey.Key_PageDown,

				Key.LeftShift => OmniKey.Key_LeftShift,
				Key.RightShift => OmniKey.Key_RightShift,
				Key.LeftCtrl => OmniKey.Key_LeftCtrl,
				Key.RightCtrl => OmniKey.Key_RightCtrl,
				Key.LeftAlt => OmniKey.Key_LeftAlt,
				Key.RightAlt => OmniKey.Key_RightAlt,

				Key.UpArrow => OmniKey.Key_ArrowUp,
				Key.DownArrow => OmniKey.Key_ArrowDown,
				Key.LeftArrow => OmniKey.Key_ArrowLeft,
				Key.RightArrow => OmniKey.Key_ArrowRight,

				Key.Minus => OmniKey.Key_Minus,
				Key.Equals => OmniKey.Key_Equals,
				Key.Backquote => OmniKey.Key_Backquote,
				Key.Quote => OmniKey.Key_Quote,
				Key.Semicolon => OmniKey.Key_Semicolon,
				Key.Comma => OmniKey.Key_Comma,
				Key.Period => OmniKey.Key_Period,
				Key.Slash => OmniKey.Key_Slash,
				Key.Backslash => OmniKey.Key_Backslash,
				Key.LeftBracket => OmniKey.Key_LeftBracket,
				Key.RightBracket => OmniKey.Key_RightBracket,

				_ => OmniKey.None
			};
		}
	}

	public class OmniSpriteMapper : IDatayard
	{
		static InputSettings mSettings;
		static GamepadType mGamepadType = GamepadType.None;
		static bool mIsGamepad;
		static bool mDeviceChangeRegistered;

		public OmniSpriteMapper(InputSettings settings)
		{
			mSettings = settings;
		}

		internal static void SetDeviceInfo(bool isPad, GamepadType gamepadType)
		{
			mIsGamepad = isPad && Gamepad.current != null;
			mGamepadType = gamepadType;

			EnsureDeviceChangeSubscription();

			if( mIsGamepad )
			{
				OmniUtil.InitButtonMappings();
			}
		}

		static void EnsureDeviceChangeSubscription()
		{
			if( mDeviceChangeRegistered )
				return;

			InputSystem.onDeviceChange += (device, change) =>
			{
				if( device is Gamepad && (change == InputDeviceChange.Added || change == InputDeviceChange.Reconnected) )
				{
					OmniUtil.InitButtonMappings();
				}
			};
			mDeviceChangeRegistered = true;
		}

		public static string MakeSprite(string input, bool tint = false, bool adjustLastChar = false)
		{
			if( input == "None" )
				return "?";

			if( adjustLastChar )
				input = OmniUtil.AdjustLastChar(input);

			string tintTag = tint ? " tint=1" : "";
			if( !input.Contains(",") && !input.Contains("\n") )
			{
				return $"<sprite name=\"{input}\"{tintTag}>";
			}

			StringBuilder result = new StringBuilder();
			string[] parts = input.Split(',');  // 키가 여러개일 때 처리
			result.Append("<size=95%>");

			for( int i = 0; i < parts.Length; i++ )
			{
				string part = parts[i];
				if( part.Contains("\n") )   // W,A,S,D 와 같은 방향키는 이미지 위치 조정
				{
					string[] subParts = part.Split('\n');
					result.Append("\n");
					part = subParts[1];
				}

				result.Append($"<sprite name=\"{part}\"{tintTag}>");
			}
			result.Append("</size>");

			return result.ToString();
		}

		public static string GetSprite(string inputKey)
		{
			switch( inputKey )
			{
				case "Input_Jump":
					return mIsGamepad ? GetPadSprite(mSettings.Jump.Pad) : GetKeySprite(mSettings.Jump.Key);

				case "Input_Run":
					return mIsGamepad ? GetPadSprite(mSettings.Run.Pad) : GetKeySprite(mSettings.Run.Key);

				case "Input_Interact":
					return mIsGamepad ? GetPadSprite(mSettings.Interact.Pad) : GetKeySprite(mSettings.Interact.Key);

				case "Input_Interact2":
					return mIsGamepad ? GetPadSprite(mSettings.Interact2.Pad) : GetKeySprite(mSettings.Interact2.Key);

				case "Input_Move":
					return mIsGamepad ? GetPadSprite(mSettings.Move.Pad) : $"{GetKeySprite(mSettings.MoveUp.Key)},\n{GetKeySprite(mSettings.MoveLeft.Key)},{GetKeySprite(mSettings.MoveDown.Key)},{GetKeySprite(mSettings.MoveRight.Key)}";

				case "Input_MoveUp":
					return mIsGamepad ? GetPadSprite(mSettings.MoveUp.Pad) : GetKeySprite(mSettings.MoveUp.Key);

				case "Input_MoveDown":
					return mIsGamepad ? GetPadSprite(mSettings.MoveDown.Pad) : GetKeySprite(mSettings.MoveDown.Key);

				case "Input_MoveLeft":
					return mIsGamepad ? GetPadSprite(mSettings.MoveLeft.Pad) : GetKeySprite(mSettings.MoveLeft.Key);

				case "Input_MoveRight":
					return mIsGamepad ? GetPadSprite(mSettings.MoveRight.Pad) : GetKeySprite(mSettings.MoveRight.Key);

				case "Input_Camera":
					return mIsGamepad ? GetPadSprite(mSettings.Camera.Pad) : GetKeySprite(mSettings.Camera.Key);

				case "Input_Sniff":
					return mIsGamepad ? GetPadSprite(mSettings.Sniff.Pad) : GetKeySprite(mSettings.Sniff.Key);

				case "Input_SitDown":
					return mIsGamepad ? GetPadSprite(mSettings.SitDown.Pad) : GetKeySprite(mSettings.SitDown.Key);

				case "Input_Switching":
					return mIsGamepad ? GetPadSprite(mSettings.Switching.Pad) : GetKeySprite(mSettings.Switching.Key);

				case "Input_CameraReorient":
					return mIsGamepad ? GetPadSprite(mSettings.CameraReorient.Pad) : GetKeySprite(mSettings.CameraReorient.Key);

				case "Input_Menu":
					return mIsGamepad ? GetPadSprite(mSettings.Menu.Pad) : GetKeySprite(mSettings.Menu.Key);

				case "Input_Attack":
					return mIsGamepad ? GetPadSprite(mSettings.Interact.Pad) : GetKeySprite(mSettings.Attack.Key);

				case "Input_Attack2":
					return mIsGamepad ? GetPadSprite(mSettings.Interact2.Pad) : GetKeySprite(mSettings.Attack2.Key);

				case "Input_CameraMoveRight":
					return mIsGamepad ? GetPadSprite(mSettings.CameraMoveRight.Pad) : GetKeySprite(mSettings.CameraMoveRight.Key);
			}

			return "";
		}

		public static string GetSprite(string inputKey, bool isGamePad)
		{
			switch( inputKey )
			{
				case "Input_Jump":
					return isGamePad ? GetPadSprite(mSettings.Jump.Pad) : GetKeySprite(mSettings.Jump.Key);

				case "Input_Run":
					return isGamePad ? GetPadSprite(mSettings.Run.Pad) : GetKeySprite(mSettings.Run.Key);

				case "Input_Interact":
					return isGamePad ? GetPadSprite(mSettings.Interact.Pad) : GetKeySprite(mSettings.Interact.Key);

				case "Input_Interact2":
					return isGamePad ? GetPadSprite(mSettings.Interact2.Pad) : GetKeySprite(mSettings.Interact2.Key);

				case "Input_Move":
					return isGamePad ? GetPadSprite(mSettings.Move.Pad) : $"{GetKeySprite(mSettings.MoveUp.Key)},\n{GetKeySprite(mSettings.MoveLeft.Key)},{GetKeySprite(mSettings.MoveDown.Key)},{GetKeySprite(mSettings.MoveRight.Key)}";

				case "Input_MoveUp":
					return isGamePad ? GetPadSprite(mSettings.MoveUp.Pad) : GetKeySprite(mSettings.MoveUp.Key);

				case "Input_MoveDown":
					return isGamePad ? GetPadSprite(mSettings.MoveDown.Pad) : GetKeySprite(mSettings.MoveDown.Key);

				case "Input_MoveLeft":
					return isGamePad ? GetPadSprite(mSettings.MoveLeft.Pad) : GetKeySprite(mSettings.MoveLeft.Key);

				case "Input_MoveRight":
					return isGamePad ? GetPadSprite(mSettings.MoveRight.Pad) : GetKeySprite(mSettings.MoveRight.Key);

				case "Input_Camera":
					return isGamePad ? GetPadSprite(mSettings.Camera.Pad) : GetKeySprite(mSettings.Camera.Key);

				case "Input_Sniff":
					return isGamePad ? GetPadSprite(mSettings.Sniff.Pad) : GetKeySprite(mSettings.Sniff.Key);

				case "Input_SitDown":
					return isGamePad ? GetPadSprite(mSettings.SitDown.Pad) : GetKeySprite(mSettings.SitDown.Key);

				case "Input_Switching":
					return isGamePad ? GetPadSprite(mSettings.Switching.Pad) : GetKeySprite(mSettings.Switching.Key);

				case "Input_CameraReorient":
					return isGamePad ? GetPadSprite(mSettings.CameraReorient.Pad) : GetKeySprite(mSettings.CameraReorient.Key);

				case "Input_Menu":
					return isGamePad ? GetPadSprite(mSettings.Menu.Pad) : GetKeySprite(mSettings.Menu.Key);

				case "Input_Attack":
					return isGamePad ? GetPadSprite(mSettings.Interact.Pad) : GetKeySprite(mSettings.Attack.Key);

				case "Input_Attack2":
					return isGamePad ? GetPadSprite(mSettings.Interact2.Pad) : GetKeySprite(mSettings.Attack2.Key);

				case "Input_CameraMoveRight":
					return isGamePad ? GetPadSprite(mSettings.CameraMoveRight.Pad) : GetKeySprite(mSettings.CameraMoveRight.Key);
			}

			return "";
		}

		public static string GetKeySprite(OmniKey key)
		{
			if( OmniKey.Key_A <= key && key <= OmniKey.Key_Z )
			{
				ButtonControl bc = OmniKeyMapper.ButtonControl(key);
				string dispKeyName = bc != null ? bc.displayName : "";
				if( dispKeyName.Length == 1 )
				{
					int idx = dispKeyName[0] - 'A';
					if( 0 <= idx && idx < 26 )
					{
						return $"Key_{dispKeyName}";
					}
				}
			}
			else if( OmniKey.Key_Digit0 <= key && key <= OmniKey.Key_Digit9 ) // 숫자 키
			{
				ButtonControl bc = OmniKeyMapper.ButtonControl(key);
				string dispKeyName = bc != null ? bc.displayName : "";
				if( dispKeyName.Length == 1 )
				{
					int idx = dispKeyName[0] - '0';
					if( 0 <= idx && idx < 10 )
					{
						return $"Key_{dispKeyName}";
					}
				}
			}
			else if( OmniKey.Key_Numpad0 <= key && key <= OmniKey.Key_Numpad9 ) // 숫자 키패드
			{
				ButtonControl bc = OmniKeyMapper.ButtonControl(key);
				string dispKeyName = bc != null ? bc.displayName : "";
				dispKeyName = dispKeyName.Substring(dispKeyName.Length - 1);
				if( dispKeyName.Length == 1 )
				{
					int idx = dispKeyName[0] - '0';
					if( 0 <= idx && idx < 10 )
					{
						return $"Key_{dispKeyName}";
					}
				}
			}
			else if( key == OmniKey.Key_RightShift ) // 아 몰라 일단 이렇게...
			{
				return "Key_LeftShift";
			}
			else if( key == OmniKey.Key_RightCtrl )
			{
				return "Key_LeftCtrl";
			}
			else if( key == OmniKey.Key_RightAlt || key == OmniKey.Key_LeftAlt )
			{
				return "Key_Alt";
			}
			else if( key == OmniKey.Mouse_Left )
			{
				return "Mouse_LeftClick_2";
			}
			else if( key == OmniKey.Mouse_Right )
			{
				return "Mouse_RightClick_2";
			}
			else if( key == OmniKey.Mouse_Middle )
			{
				return "Mouse_MiddleClick_2";
			}
			else if( key == OmniKey.Mouse_Move )
			{
				return "Mouse_Move_5";
			}

			return $"{key}";
		}

		public static string GetPadSprite(OmniKey key)
		{
			if( key == OmniKey.None )
				return "None";

			// 버튼 매핑 기본값 (Xbox 스타일)
			string buttonWest = "Pad_X";
			string buttonNorth = "Pad_Y";
			string buttonSouth = "Pad_A";
			string buttonEast = "Pad_B";
			string leftTrigger = "Pad_X_LT";
			string rightTrigger = "Pad_X_RT";
			string leftShoulder = "Pad_X_LB";
			string rightShoulder = "Pad_X_RB";
			string startButton = "Pad_X_Menu";
			string selectButton = "Pad_X_Tab";
			string dpad = "Pad_X_Dpad";
			string dpadUp = "Pad_X_Dpad_Up";
			string dpadDown = "Pad_X_Dpad_Down";
			string dpadLeft = "Pad_X_Dpad_Left";
			string dpadRight = "Pad_X_Dpad_Right";
			string dpadXAxis = "Pad_X_Dpad_LeftRight";
			string dpadYAxis = "Pad_X_Dpad_UpDown";
			string leftStickPress = "Pad_LStick_Press_2";
			string rightStickPress = "Pad_RStick_Press_2";

			// 게임패드 타입에 따라 스프라이트 키 변경
			switch( mGamepadType )
			{
				case GamepadType.PS5:
					buttonWest = "Pad_P_Square";
					buttonNorth = "Pad_P_Triangle";
					buttonSouth = "Pad_P_Cross";
					buttonEast = "Pad_P_Circle";
					leftTrigger = "Pad_P_L2";
					rightTrigger = "Pad_P_R2";
					leftShoulder = "Pad_P_L1";
					rightShoulder = "Pad_P_R1";
					startButton = "Pad_P_Option";
					selectButton = "Pad_P_Share";
					dpad = "Pad_P_Dpad";
					dpadUp = "Pad_P_Dpad_Up";
					dpadDown = "Pad_P_Dpad_Down";
					dpadLeft = "Pad_P_Dpad_Left";
					dpadRight = "Pad_P_Dpad_Right";
					dpadXAxis = "Pad_P_Dpad_LeftRight";
					dpadYAxis = "Pad_P_Dpad_UpDown";
					leftStickPress = "Pad_P_LStick_Press_2";
					rightStickPress = "Pad_P_RStick_Press_2";
					break;

				case GamepadType.SW1:
					buttonWest = "Pad_Y";     // Y (왼쪽)
					buttonNorth = "Pad_X";    // X (위쪽)
					buttonSouth = "Pad_B";    // B (아래쪽)
					buttonEast = "Pad_A";     // A (오른쪽)
					leftTrigger = "Pad_S_ZL";
					rightTrigger = "Pad_S_ZR";
					leftShoulder = "Pad_S_L";
					rightShoulder = "Pad_S_R";
					startButton = "Pad_S_+";
					selectButton = "Pad_S_-";
					dpad = "Pad_S_Dpad";
					dpadUp = "Pad_S_Dpad_Up";
					dpadDown = "Pad_S_Dpad_Down";
					dpadLeft = "Pad_S_Dpad_Left";
					dpadRight = "Pad_S_Dpad_Right";
					dpadXAxis = "Pad_S_Dpad_LeftRight";
					dpadYAxis = "Pad_S_Dpad_UpDown";
					break;

					// Xbox는 기본값 사용
			}

			return key switch
			{
				OmniKey.Gamepad_ButtonNorth => buttonNorth,
				OmniKey.Gamepad_ButtonSouth => buttonSouth,
				OmniKey.Gamepad_ButtonWest => buttonWest,
				OmniKey.Gamepad_ButtonEast => buttonEast,

				OmniKey.Gamepad_LStick => "Pad_LStick_5",
				OmniKey.Gamepad_RStick => "Pad_RStick_5",

				OmniKey.Gamepad_LStick_Up => "Pad_LStick_Up_2",
				OmniKey.Gamepad_LStick_Down => "Pad_LStick_Down_2",
				OmniKey.Gamepad_LStick_Left => "Pad_LStick_Left_2",
				OmniKey.Gamepad_LStick_Right => "Pad_LStick_Right_2",
				OmniKey.Gamepad_RStick_Up => "Pad_RStick_Up_2",
				OmniKey.Gamepad_RStick_Down => "Pad_RStick_Down_2",
				OmniKey.Gamepad_RStick_Left => "Pad_RStick_Left_2",
				OmniKey.Gamepad_RStick_Right => "Pad_RStick_Right_2",

				OmniKey.Gamepad_LStick_Horizontal => "Pad_LStick_LeftRight_3",
				OmniKey.Gamepad_LStick_Vertical => "Pad_LStick_UpDown_3",
				OmniKey.Gamepad_RStick_Horizontal => "Pad_RStick_LeftRight_3",
				OmniKey.Gamepad_RStick_Vertical => "Pad_RStick_UpDown_3",

				OmniKey.Gamepad_LStick_Press => leftStickPress,
				OmniKey.Gamepad_RStick_Press => rightStickPress,

				OmniKey.Gamepad_LT => leftTrigger,
				OmniKey.Gamepad_RT => rightTrigger,
				OmniKey.Gamepad_LB => leftShoulder,
				OmniKey.Gamepad_RB => rightShoulder,

				OmniKey.Gamepad_Start => startButton,
				OmniKey.Gamepad_Select => selectButton,

				OmniKey.Gamepad_DPad => dpad,
				OmniKey.Gamepad_DPad_Horizontal => dpadXAxis,
				OmniKey.Gamepad_DPad_Vertical => dpadYAxis,
				OmniKey.Gamepad_DPad_Up => dpadUp,
				OmniKey.Gamepad_DPad_Down => dpadDown,
				OmniKey.Gamepad_DPad_Left => dpadLeft,
				OmniKey.Gamepad_DPad_Right => dpadRight,
				_ => "None"
			};
		}

		public ref readonly WineValue Get(string name)
		{
			string spriteName = GetSprite(name);
			if( spriteName.IsEmpty() )
				return ref WineValue.Empty;

			return ref WineValue.MakeReference(MakeSprite(spriteName));
		}
	}

	public static class OmniUtil
	{
		static readonly Dictionary<ButtonControl, OmniKey> ButtonControlToOmniKey = new Dictionary<ButtonControl, OmniKey>();

		internal static void InitButtonMappings()
		{
			Gamepad pad = Gamepad.current;
			if( pad == null )
				return;

			ButtonControlToOmniKey[pad.buttonSouth] = OmniKey.Gamepad_ButtonSouth;
			ButtonControlToOmniKey[pad.buttonNorth] = OmniKey.Gamepad_ButtonNorth;
			ButtonControlToOmniKey[pad.buttonEast] = OmniKey.Gamepad_ButtonEast;
			ButtonControlToOmniKey[pad.buttonWest] = OmniKey.Gamepad_ButtonWest;

			ButtonControlToOmniKey[pad.leftShoulder] = OmniKey.Gamepad_LB;
			ButtonControlToOmniKey[pad.rightShoulder] = OmniKey.Gamepad_RB;
			ButtonControlToOmniKey[pad.leftTrigger] = OmniKey.Gamepad_LT;
			ButtonControlToOmniKey[pad.rightTrigger] = OmniKey.Gamepad_RT;

			ButtonControlToOmniKey[pad.startButton] = OmniKey.Gamepad_Start;
			ButtonControlToOmniKey[pad.selectButton] = OmniKey.Gamepad_Select;

			ButtonControlToOmniKey[pad.dpad.up] = OmniKey.Gamepad_DPad_Up;
			ButtonControlToOmniKey[pad.dpad.down] = OmniKey.Gamepad_DPad_Down;
			ButtonControlToOmniKey[pad.dpad.left] = OmniKey.Gamepad_DPad_Left;
			ButtonControlToOmniKey[pad.dpad.right] = OmniKey.Gamepad_DPad_Right;

			ButtonControlToOmniKey[pad.leftStickButton] = OmniKey.Gamepad_LStick_Press;
			ButtonControlToOmniKey[pad.rightStickButton] = OmniKey.Gamepad_RStick_Press;

			ButtonControlToOmniKey[pad.leftStick.up] = OmniKey.Gamepad_LStick_Up;
			ButtonControlToOmniKey[pad.leftStick.down] = OmniKey.Gamepad_LStick_Down;
			ButtonControlToOmniKey[pad.leftStick.left] = OmniKey.Gamepad_LStick_Left;
			ButtonControlToOmniKey[pad.leftStick.right] = OmniKey.Gamepad_LStick_Right;

			ButtonControlToOmniKey[pad.rightStick.up] = OmniKey.Gamepad_RStick_Up;
			ButtonControlToOmniKey[pad.rightStick.down] = OmniKey.Gamepad_RStick_Down;
			ButtonControlToOmniKey[pad.rightStick.left] = OmniKey.Gamepad_RStick_Left;
			ButtonControlToOmniKey[pad.rightStick.right] = OmniKey.Gamepad_RStick_Right;
		}

		public static (OmniKey, bool) GetKeyInput()
		{
			if( Keyboard.current == null )
				return (OmniKey.None, false);

			if( Keyboard.current.anyKey.wasReleasedThisFrame )
			{
				foreach( KeyControl key in Keyboard.current.allKeys )
				{
					if( key.wasReleasedThisFrame )
					{
						OmniKey omniKey = OmniKeyMapper.MapToOmniKey(key.keyCode);
						if( omniKey != OmniKey.None )
							return (OmniKeyMapper.Normalize(omniKey), true);
						else
							return (OmniKey.None, true);
					}
				}
			}
			return (OmniKey.None, false);
		}

		public static OmniKey GetMouseInput()
		{
			if( Mouse.current.leftButton.wasReleasedThisFrame )
				return OmniKey.Mouse_Left;
			if( Mouse.current.rightButton.wasReleasedThisFrame )
				return OmniKey.Mouse_Right;
			if( Mouse.current.middleButton.wasReleasedThisFrame )
				return OmniKey.Mouse_Middle;

			return OmniKey.None;
		}

		public static (OmniKey, bool) GetPadInput()
		{
			foreach( var pad in Gamepad.all )
			{
				if( pad == null )
					continue;

				foreach( InputControl control in pad.allControls )
				{
					if( control is ButtonControl button && button.wasReleasedThisFrame )
					{
						if( ButtonControlToOmniKey.TryGetValue(button, out OmniKey omniKey) )
							return (omniKey, true);
						else
							return (OmniKey.None, true);
					}
				}
			}
			return (OmniKey.None, false);
		}

		public static string GetInputActionKeyName(InputAction action)
		{
			switch( action )
			{
				case InputAction.Move: return "Input_Move";
				case InputAction.Run: return "Input_Run";
				case InputAction.Jump: return "Input_Jump";
				case InputAction.Sniff: return "Input_Sniff";
				case InputAction.Use1: return "Input_Interact";
				case InputAction.Use2: return "Input_Interact2";
				case InputAction.Sit: return "Input_SitDown";
				case InputAction.Switching: return "Input_Switching";
				case InputAction.CameraReorient: return "Input_CameraReorient";
				case InputAction.Camera: return "Input_Camera";
				case InputAction.Menu: return "Input_Menu";
			}

			return "";
		}

		public static string GetInputActionKeyName(BaristaAction_SimpleButtonAction.ActionKey actionType)
		{
			switch( actionType )
			{
				case BaristaAction_SimpleButtonAction.ActionKey.Move: return "Input_Move";
				case BaristaAction_SimpleButtonAction.ActionKey.Run: return "Input_Run";
				case BaristaAction_SimpleButtonAction.ActionKey.Jump: return "Input_Jump";
				case BaristaAction_SimpleButtonAction.ActionKey.Sniff: return "Input_Sniff";
				case BaristaAction_SimpleButtonAction.ActionKey.Use1: return "Input_Interact";
				case BaristaAction_SimpleButtonAction.ActionKey.Use2: return "Input_Interact2";
				case BaristaAction_SimpleButtonAction.ActionKey.Sit: return "Input_SitDown";
				case BaristaAction_SimpleButtonAction.ActionKey.Switching: return "Input_Switching";
				case BaristaAction_SimpleButtonAction.ActionKey.MoveLeft: return "Input_MoveLeft";
				case BaristaAction_SimpleButtonAction.ActionKey.MoveRight: return "Input_MoveRight";
				case BaristaAction_SimpleButtonAction.ActionKey.MoveUp: return "Input_MoveUp";
				case BaristaAction_SimpleButtonAction.ActionKey.MoveDown: return "Input_MoveDown";
			}

			return "";
		}

		public static bool NeedsUIAnimation(string keyName)
		{
			string spriteName = OmniSpriteMapper.GetSprite(keyName);
			if( spriteName.IsEmpty() )
				return false;

			char endChar = spriteName[spriteName.Length - 1];
			char penultChar = spriteName.Length > 1 ? spriteName[spriteName.Length - 2] : ' ';
			if( char.IsDigit(endChar) && penultChar == '_')
				return true;
			else
				return false;
		}

		public static bool IsPairedUI(string key1, string key2, out string combinedKey)
		{
			combinedKey = "";

			if( Game.InputMan.IsGamepad == false )
				return false;

			if( key1 == "Pad_LStick_Left_2" && key2 == "Pad_LStick_Right_2" )
			{
				combinedKey = OmniSpriteMapper.GetPadSprite(OmniKey.Gamepad_LStick_Horizontal);
				return true;
			}
			else if( key1 == "Pad_LStick_Right_2" && key2 == "Pad_LStick_Left_2" )
			{
				combinedKey = OmniSpriteMapper.GetPadSprite(OmniKey.Gamepad_LStick_Horizontal);
				return true;
			}
			else if( key1 == "Pad_LStick_Up_2" && key2 == "Pad_LStick_Down_2" )
			{
				combinedKey = OmniSpriteMapper.GetPadSprite(OmniKey.Gamepad_LStick_Vertical);
				return true;
			}
			else if( key1 == "Pad_LStick_Down_2" && key2 == "Pad_LStick_Up_2" )
			{
				combinedKey = OmniSpriteMapper.GetPadSprite(OmniKey.Gamepad_LStick_Vertical);
				return true;
			} // 뭔가 더 있나?

			return false;
		}

		public static string AdjustLastChar(string spriteName)
		{
			const string PreText = "Input_";

			if( spriteName.Length <= PreText.Length )
				return spriteName;

			char endChar = spriteName[spriteName.Length - 1];
			char underBarChar = spriteName[spriteName.Length - 2];

			if( char.IsDigit(endChar) && underBarChar.Equals('_'))
			{
				spriteName = spriteName.Remove(spriteName.Length - 1) + '1';
			}

			return spriteName;
		}
	}
}
