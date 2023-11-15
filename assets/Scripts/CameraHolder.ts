import EatingUtil from "./EatingUtil";
import Touch from "./touch";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CameraHolder extends cc.Component {
  @property([cc.Node])
  cameras: cc.Node[] = [];

  @property(Touch)
  touchNode: Touch = null;

  public player;
  private zoomRatio = 1;
  private ModifyCamera(dt: number) {
  
    if (!this.player || !cc.isValid(this.player)) return;
  
    let position = this.node.parent.convertToNodeSpaceAR(
      this.player.node.parent.convertToWorldSpaceAR(
        this.player.node.getPosition()
      )
    );

    this.cameras.forEach((value) => {
      value.getComponent(cc.Camera).zoomRatio = EatingUtil.Lerp(
        value.getComponent(cc.Camera).zoomRatio,
        this.zoomRatio,
        dt
      );

      let prop: ZoomRatioXY = ZoomRatioXY.getProp(this.zoomRatio);
      if (!prop) return;
      this.setMaxOrMinCameraPositon(position, this.zoomRatio, prop);
      this.touchNode.followCamera(position);
      value.setPosition(position);
    });
  }

  public setMaxOrMinCameraPositon(
    position: cc.Vec2,
    roomRatio: number,
    prop: ZoomRatioXY
  ) {
    if (position.x > prop.x) {
      position.x = prop.x;
    }
    if (position.x < -prop.x) {
      position.x = -prop.x;
    }

    if (position.y > prop.y) {
      position.y = prop.y;
    }
    if (position.y < -prop.y) {
      position.y = -prop.y;
    }
  }
  public InPlayerHorizons(worldPos): boolean {
    let camera = this.cameras[0];
    let HorizonsSize = cc
      .v2(cc.winSize.width, cc.winSize.height)
      .mul(1 / camera.getComponent(cc.Camera).zoomRatio);
    console.log(HorizonsSize.x, HorizonsSize.y);
    if (
      worldPos.x <
        camera.parent.convertToWorldSpaceAR(camera.getPosition()).x -
          HorizonsSize.x / 2 ||
      worldPos.x >
        camera.parent.convertToWorldSpaceAR(camera.getPosition()).x +
          HorizonsSize.x / 2 ||
      worldPos.y >
        camera.parent.convertToWorldSpaceAR(camera.getPosition()).y +
          HorizonsSize.y / 2 ||
      worldPos.y <
        camera.parent.convertToWorldSpaceAR(camera.getPosition()).y -
          HorizonsSize.y / 2
    )
      return false;
    return true;
  }

  public RoleInPlayerHorizons(role): boolean {
    let camera = this.cameras[0];
    let cameraWorldPos: cc.Vec2 = camera.parent.convertToWorldSpaceAR(
      camera.getPosition()
    );
    let roleWorldPos: cc.Vec2 = role.node.parent.convertToWorldSpaceAR(
      role.node.getPosition()
    );
    let HorizonsSize = cc
      .v2(cc.winSize.width, cc.winSize.height)
      .mul(1 / camera.getComponent(cc.Camera).zoomRatio);
    let cameraRect: cc.Rect = cc.Rect.fromMinMax(
      cc.v2(
        cameraWorldPos.x - HorizonsSize.x / 2,
        cameraWorldPos.y - HorizonsSize.y / 2
      ),
      cc.v2(
        cameraWorldPos.x + HorizonsSize.x / 2,
        cameraWorldPos.y + HorizonsSize.y / 2
      )
    );
    let roleRect: cc.Rect = cc.Rect.fromMinMax(
      cc.v2(roleWorldPos.x - role.radius, roleWorldPos.y - role.radius),
      cc.v2(roleWorldPos.x + role.radius, roleWorldPos.y + role.radius)
    );
    if (cameraRect.intersects(roleRect)) return true;
    return false;
  }

  public SetZoomRatio(level) {
    let zoomRatio: number = 1;
    // if (level <= 2) zoomRatio = 0.7;
    // else if (level <= 4) zoomRatio = 0.9;
    // else if (level <= 6) zoomRatio = 0.8;
    // else zoomRatio = 0.7;

    // else if (level <= 8) zoomRatio = 0.7;
    // else {
    //   zoomRatio = 0.6;
    // }

    // if (this.zoomRatio != zoomRatio) {
    this.touchNode.changeTouchSize(ZoomRatioXY.getProp(zoomRatio));
    // }
    this.touchNode.bindTouchEvent();
    this.zoomRatio = zoomRatio;
  }

  update(dt) {
    this.ModifyCamera(dt);
  }
}

export class ZoomRatioXY {
  x: number;
  y: number;
  width: number;
  height: number;

  static instance: ZoomRatioXY = null;

  1 = { x: 1540, y: 960, width: 1920, height: 1080 } as ZoomRatioXY;
  // 0.9 = { x: 435, y: 400, width: 1920, height: 1080 } as ZoomRatioXY;
  // 0.8 = { x: 300, y: 330, width: 1920, height: 1080 } as ZoomRatioXY;
  // 0.7 = { x: 130, y: 230, width: 1920, height: 1080 } as ZoomRatioXY;

  public static getProp(zoomRatio?: number): ZoomRatioXY {
    if (!this.instance) this.instance = new ZoomRatioXY()[1];
    if (zoomRatio) {
      this.instance = new ZoomRatioXY()[zoomRatio];
    }
    return this.instance;
  }
}
