import { ZoomRatioXY } from "./CameraHolder";
import { IInput } from "./IInput";
const { ccclass, property } = cc._decorator;

@ccclass
export class VirtualJoystic extends cc.Component implements IInput {
  @property(cc.Float)
  private maxDistance = 10;

  @property(cc.Node) private knob: cc.Node = null;

  defaultPosition: cc.Vec2 = new cc.Vec2();

  public init(): void {
    this.deactivateJoystic();
  }

  public getAxis(): cc.Vec2 {
    return new cc.Vec2(
      this.knob.position.x / this.maxDistance,
      this.knob.position.y / this.maxDistance
    );
  }

  activateTouchJoystic(pos?: cc.Vec2): void {
    this.activateJoystic(pos);
  }

  activateMouseJoystic(e: cc.Event.EventMouse): void {
    this.activateJoystic(e.getLocation());
  }

  activateJoystic(location: cc.Vec2): void {
    this.node.active = true;
    this.defaultPosition = location;
    this.node.setPosition(
      new cc.Vec3(this.defaultPosition.x, this.defaultPosition.y, 0)
    );
    this.knob.position = new cc.Vec3();
  }

  deactivateJoystic(): void {
    if (this.knob) this.knob.setPosition(new cc.Vec2(0, 0));
  }

  moveKnobTouch(pos: cc.Vec2, virtualJoysticPos: cc.Vec2): void {
    this.moveKnob(
      new cc.Vec2(pos.x - virtualJoysticPos.x, pos.y - virtualJoysticPos.y)
    );
  }

  moveKnobMouse(e: cc.Event.EventMouse): void {
    this.moveKnob(e.getLocation());
  }

  moveKnob(location: cc.Vec2): void {
    let x: number = location.x;
    let y: number = location.y;

    const length: number = Math.sqrt(location.x ** 2 + location.y ** 2);
    if (this.maxDistance < length) {
      const multiplier: number = this.maxDistance / length;
      x *= multiplier;
      y *= multiplier;
    }

    this.knob.position = new cc.Vec3(x, y, 0);
  }
}
