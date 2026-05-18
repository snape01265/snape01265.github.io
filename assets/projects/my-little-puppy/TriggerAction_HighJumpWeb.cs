using System.Collections;
using System.Collections.Generic;
using LmgLib;
using LmgLib.Unity;
using Puppy;
using UnityEngine;

namespace Puppy
{
	public class TriggerAction_HighJumpWeb : MonoBehaviour, IAreaTriggerAction
	{
		[TooltipLine("점프 높이")]
		public float JumpForce;
		[TooltipLine("점프 도중 전진 이동 속도")]
		public float JumpSpeed;
		[TooltipLine("점프 도중 전진 이동의 가속도. 최대 달리기 속도까지 증가")]
		public float JumpAcceleration;
		[TooltipLine("속도를 바꾸는데 걸리는 시간")]
		public float SwingDuration;
		[TooltipLine("방방 뛰었을 때 점프 높이")]
		public float JumpOnJumpHeight;
		[TooltipLine("거미줄 핸들. 점프하는 동안 플레이어 위치를 따라 움직인다.")]
		public Transform SwingHandle;
		[TooltipLine("거미줄 튀어오르는 높이")]
		public float SwingAmp = 3;

		Transform mSwingTrackTarget;
		LVector3 mStartPos;
		float mSineTime;

		enum Phase { Idle, TrackPlayer, SwingSine }
		Phase mPhase;

		void Awake()
		{
			if( SwingHandle != null )
				mStartPos = SwingHandle.position;
		}

		public void OnEnterArea(PlayerContext pc)
		{
			InputMover2 mover = Game.NormalMode.ActivePC.InputMover;

			MoverStateHighJump state = mover.EnsureChangeState<MoverStateHighJump>();

			state.SetHighJumpMove(Game.NormalMode.PlayActor.Dir.RightVectorFloat().X0Y, JumpSpeed, JumpForce, JumpAcceleration, SwingDuration, JumpOnJumpHeight);

			mPhase = Phase.Idle;

			if( SwingHandle != null )
			{
				mPhase = Phase.TrackPlayer;
				mSwingTrackTarget = Game.NormalMode.PlayActor.Tm;
			}
		}

		void Update()
		{
			if( mPhase == Phase.TrackPlayer )
			{
				UpdateTrackPlayer();
			}
			else if( mPhase == Phase.SwingSine )
			{
				UpdateSwingSine();
			}
		}

		void UpdateTrackPlayer()
		{
			const float HandleOffset = 0.2f;        // 핸들이 실제 거미줄 메쉬보다 조금 위에 있다.. -_-

			LVector3 targetPos = mSwingTrackTarget.position;
			LVector3 handlePos = SwingHandle.position;
			handlePos.Y = targetPos.Y + HandleOffset;

			// 아래로 내려갈 동안만 추적하고 위로 올라가면, sine 곡선으로 흔들린다.
			float diffY = handlePos.Y - mStartPos.Y;
			if( diffY < 0 )
			{
				SwingHandle.position = handlePos;
			}
			else
			{
				mPhase = Phase.SwingSine;
				mSineTime = 0;
			}
		}

		void UpdateSwingSine()
		{
			const float DampingDuration = 2.0f;

			float s = LMath.Sin(mSineTime * LMath.PI * 8);
			float amp = SwingAmp * (1 - LMath.Saturate(mSineTime / DampingDuration));

			SwingHandle.position = mStartPos.AddY(amp * s);

			mSineTime += LTime.DeltaTime;

			if( DampingDuration <= mSineTime )
			{
				SwingHandle.position = mStartPos;
				mPhase = Phase.Idle;
			}
		}
	}
}