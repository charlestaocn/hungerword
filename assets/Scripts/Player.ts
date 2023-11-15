import RoleBase from "./Base/RoleBase";
import EatingGame from "./EatingGame";
import { IInput } from "./IInput";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Player extends RoleBase {
  static instance: Player;

  private inputDir: cc.Vec2 = cc.Vec2.ZERO;

  private input: IInput = null;

  onLoad() {
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.OnKeyDown, this);
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.OnKeyUp, this);
    Player.instance = this;
  }

  initInput(inputs: IInput) {
    if (!this.input) {
      this.input = inputs;
    }
  }

  OnKeyDown(e: cc.Event.EventKeyboard) {
    if (e.keyCode == cc.macro.KEY.space) {
      this.RoleDeath();
    }
    switch (e.keyCode) {
      case cc.macro.KEY.a:
        this.inputDir.x = -1;
        break;
      case cc.macro.KEY.d:
        this.inputDir.x = +1;
        break;
      case cc.macro.KEY.w:
        this.inputDir.y = +1;
        break;
      case cc.macro.KEY.s:
        this.inputDir.y = -1;
        break;
    }
  }

  OnKeyUp(e: cc.Event.EventKeyboard) {
    switch (e.keyCode) {
      case cc.macro.KEY.a:
        if (-1 == this.inputDir.x) this.inputDir.x = 0;
        break;
      case cc.macro.KEY.d:
        if (+1 == this.inputDir.x) this.inputDir.x = 0;
        break;
      case cc.macro.KEY.w:
        if (+1 == this.inputDir.y) this.inputDir.y = 0;
        break;
      case cc.macro.KEY.s:
        if (-1 == this.inputDir.y) this.inputDir.y = 0;
        break;
    }
  }

  //   private Move(dt: number) {
  //     this.moveDir = this.inputDir.normalize();
  //     this.node.x += this.moveDir.x * this.speed * dt;
  //     this.node.y += this.moveDir.y * this.speed * dt;
  //   }

  private Move(deltaTime: number): void {
    if (!this.input) return;
    const movement: cc.Vec2 = this.input.getAxis();
    if (!movement.equals(cc.Vec2.ZERO)) {
      movement.x *= deltaTime * this.speed;
      movement.y *= deltaTime * this.speed;
      const newPosition: cc.Vec3 = this.node.position;
      newPosition.x += movement.x;
      newPosition.y += movement.y;
      this.node.setPosition(newPosition);
    }
  }

  update(dt) {
    super.lateUpdate(dt);
    this.Move(dt);
    this.game.cameraHolder.SetZoomRatio(this.roleLevel);
    this.border();
  }

  border() {
    let playerPos = this.node.parent.convertToWorldSpaceAR(
      this.node.getPosition()
    );
    let wallPos = this.game.wallNode.parent.convertToWorldSpaceAR(
      this.game.wallNode.getPosition()
    );
    if (playerPos.x > wallPos.x + this.game.wallNode.width / 2)
      playerPos.x = wallPos.x + this.game.wallNode.width / 2;
    if (playerPos.x < wallPos.x - this.game.wallNode.width / 2)
      playerPos.x = wallPos.x - this.game.wallNode.width / 2;
    if (playerPos.y < wallPos.y - this.game.wallNode.height / 2)
      playerPos.y = wallPos.y - this.game.wallNode.height / 2;
    if (playerPos.y > wallPos.y + this.game.wallNode.height / 2)
      playerPos.y = wallPos.y + this.game.wallNode.height / 2;
    this.node.setPosition(this.node.parent.convertToNodeSpaceAR(playerPos));
  }
}
