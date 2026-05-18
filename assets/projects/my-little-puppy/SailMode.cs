using System;
using System.Collections;
using System.Collections.Generic;
using LmgLib;
using LmgLib.Unity;

namespace Puppy
{
	/*
	 * 플레이어가 항해 모드에 들어갈때 전환해줘야 할 것들을 전환해준다.
	 * 항해 모드 동안은 SailActor로 대채되어야 한다. 행해 모드를 끝낼때 원래 PlayableActor로 돌아간다.
	 */
	public class SailMode : IPlayMode
	{
		SailActor mActor;
		BoatMover2 mBoatMover;
		BoatChaser mBoatChaser;
		PlayerContext mMoverContext;
		SailSafePoint mSailSafePoint;
		bool mOnBoat;

		public SailSafePoint SailSafePoint => mSailSafePoint;
		public BoatMover2 BoatMover => mBoatMover;
		public BoatChaser BoatChaser => mBoatChaser;
		public SailActor Actor => mActor;
		public bool OnBoat => mOnBoat;
		public bool NeedWorldUpdate => true;
		public LVector3 TriggerPos => mBoatMover.Inst.Pos;

		public SailMode(BoatMover2 player, BoatChaser lifeboat)
		{
			mBoatMover = player;
			mBoatChaser = lifeboat;
			mActor = new SailActor(player.Inst, lifeboat.Inst);
			mOnBoat = false;
		}

		public void OnActivate(IPlayMode prev)
		{
			Game.World?.SoundMan?.ApplyAudioSnapshot(AudioSnapshotNames.InGame, 0.3f);

			if( prev is not PauseMode )
			{
				mOnBoat = true;
				mBoatChaser.EnterBoat();
				mBoatMover.EnterBoat();
				Game.World.FindActorByName(PuppyConst.BongguName).SetActive(false);   //봉구가 아닌 상태에서 배를 타는 일은 없을것...
			}
		}

		public void OnDeactivate(IPlayMode next)
		{		
			if( next is not PauseMode )
			{
				Game.World.FindActorByName(PuppyConst.BongguName).SetActive(true);
				mOnBoat = false;
				mBoatChaser.ExitBoat();
				mBoatMover.ExitBoat();
				CleanUpSound();
			}
		}

		public void CleanUpSound()
		{
			mBoatChaser.StopPassengersSound();
		}

		public void OnUpdate()
		{
			mActor.OnUpdate(LTime.DeltaTime);
		}

		public void OnLateUpdate()
		{
			mActor.OnLateUpdate(LTime.DeltaTime);
		}

		public void SetMoverContext(PlayerContext pc)
		{
			mMoverContext = pc;
			if( pc != null )
			{
				mActor.ActivatePC(mMoverContext);
			}
			else
			{
				mActor.DeactivatePC();
			}
		}

		public void SetSailSafePoint(SailSafePoint ssp)
		{
			mSailSafePoint = ssp;
		}

		public void RespawnAtLastCheckPoint(SailSafePoint ssp)
		{
			if( ssp != null )
				ssp.Activate();
			else
				mSailSafePoint.Activate();
		}
	}
}