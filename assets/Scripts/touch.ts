const { ccclass, property } = cc._decorator;
import { ZoomRatioXY } from "./CameraHolder";
import EatingGame from "./EatingGame";
import { MultiInput } from "./MultiInput";
import Player from "./Player";
import { VirtualJoystic } from "./VirtualJoystic";

@ccclass
export default class Touch extends cc.Component {
  @property(VirtualJoystic)
  private virtualJoystic: VirtualJoystic = null;

  private game: EatingGame = null;

  // @property(cc.Node)
  // private leftBlack: cc.Node = null;

  // @property(cc.Node)
  // private topBlack: cc.Node = null;

  // @property(cc.Node)
  // private rightBlack: cc.Node = null;

  // @property(cc.Node)
  // private bottomBlack: cc.Node = null;

  initTouch(game: EatingGame) {
    this.game = game;
    if (Player.instance) {
      Player.instance.initInput(new MultiInput([this.virtualJoystic]));
    }
    this.activateTouchJoystic();
  }

  followCamera(position: cc.Vec2) {
    this.node.setPosition(position);
  }

  moveKnobTouch(e: cc.Event.EventTouch) {
    let pos = this.virtualJoystic.node.parent.convertToNodeSpaceAR(
      this.virtualJoystic.node.parent.convertToWorldSpaceAR(
        this.virtualJoystic.node.getPosition()
      )
    );

    let thisContentSzie = this.node.getContentSize();
    let virJoyPos = {
      x: pos.x + thisContentSzie.width / 2,
      y: pos.y + thisContentSzie.height / 2,
    } as cc.Vec2;

    this.virtualJoystic.moveKnobTouch(e.getLocation(), virJoyPos);
  }

  deactivateJoystic() {
    this.virtualJoystic.deactivateJoystic();
  }

  activateTouchJoystic(e?: cc.Event.EventTouch) {
    let pos = new cc.Vec2();
    if (e) {
      pos = this.node.convertToNodeSpaceAR(e.getLocation());
    } else {
      pos.x = -700;
      pos.y = -300;
    }
    this.virtualJoystic.activateTouchJoystic(pos);
  }

  moveKnobMouse(e: cc.Event.EventMouse) {
    this.virtualJoystic.moveKnobMouse(e);
  }
  activateMouseJoystic(e: cc.Event.EventMouse) {
    this.virtualJoystic.activateMouseJoystic(e);
  }

  changeTouchSize(zoomRatioXY: ZoomRatioXY) {
    if (zoomRatioXY) {
      this.node.width = zoomRatioXY.width;
      this.node.height = zoomRatioXY.height;
      // let leftWidCom = this.leftBlack.getComponent(cc.Widget);
      // let rightWidCom = this.rightBlack.getComponent(cc.Widget);
      // let topWidCom = this.topBlack.getComponent(cc.Widget);
      // let bottomWidCom = this.bottomBlack.getComponent(cc.Widget);
      // leftWidCom.right = zoomRatioXY.width;
      // rightWidCom.left = -zoomRatioXY.width;
      // topWidCom.bottom = zoomRatioXY.height;
      // bottomWidCom.top = -zoomRatioXY.height;
    }
  }

  bindTouchEvent() {
    this.node.on(cc.Node.EventType.MOUSE_DOWN, this.activateMouseJoystic, this);
    this.node.on(cc.Node.EventType.MOUSE_UP, this.deactivateJoystic, this);
    this.node.on(cc.Node.EventType.MOUSE_MOVE, this.moveKnobMouse, this);

    // this.node.on(
    //   cc.Node.EventType.TOUCH_START,
    //   this.activateTouchJoystic,
    //   this
    // );
    this.node.on(cc.Node.EventType.TOUCH_END, this.deactivateJoystic, this);
    this.node.on(cc.Node.EventType.TOUCH_MOVE, this.moveKnobTouch, this);
  }

  protected update(dt: number): void {
    if (this.game && this.game.isStoped()) {
      this.deactivateJoystic();
    }
  }
}
