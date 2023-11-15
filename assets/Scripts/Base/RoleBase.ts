import Boy from "../Boy";
import BoyManager from "../BoyManager";
import EatingGame from "../EatingGame";
import EatingGameConfig from "../EatingGameConfig";
import { nodePoolEnum } from "../EatingNodePool";
import EatingUtil from "../EatingUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RoleBase extends cc.Component {
  levelLabel: cc.Label = null;
  protected roleLevel: number = 1;
  public Ai: boolean = true;
  protected boyManager: BoyManager;
  protected moveDir: cc.Vec2 = cc.Vec2.ZERO;
  private aiMovePos: cc.Vec2 = cc.Vec2.ZERO;
  public boysNode: cc.Node;
  public beEatingRole: RoleBase = null;
  public eatingRole: RoleBase[] = [];
  public eatingBoy: Boy[] = [];
  public eatingTime: number = 0;
  public speed: number = EatingGameConfig.roleMoveSpeed;
  public id: number;
  public radius: number;
  public beDeth: boolean = false;
  public isDeth: boolean = false;
  public game: EatingGame;
  public visualNodePool: nodePoolEnum;

  public unuse() {
    // console.log("放入节点池");
  }

  public reuse() {
    // console.log("从节点池拿出");
  }

  public GetColor(level: number): string {
    let color: string = "#FF6161";
    switch (level) {
      case 1:
        color = "#FFB661";
        break;
      case 2:
        color = "#FFFC61";
        break;
      case 3:
        color = "#84FF61";
        break;
      case 4:
        color = "#61FFB0";
        break;
      case 5:
        color = "#61FFDC";
        break;
      case 6:
        color = "#61C9FF";
        break;
      case 7:
        color = "#616AFF";
        break;
      case 8:
        color = "#AA61FF";
        break;
      case 9:
        color = "#E961FF";
        break;
      case 10:
        color = "#FF61A3";
        break;
    }
    return color;
  }

  public Init(game: EatingGame, level: number = 1, ai: boolean = true) {
    this.game = game;
    this.roleLevel = level;
    this.visualNodePool = this.game.eatingNodePool.GetVisualNodePool(
      this.roleLevel
    );
    this.Ai = ai;
    let color: cc.Color = cc.Color.BLACK;
    cc.Color.fromHEX(color, this.GetColor(this.roleLevel));
    if (!this.Ai) {
      this.visualNodePool = nodePoolEnum.playerVisual;
      cc.Color.fromHEX(color, "#FF6161");
    }
    this.node.getChildByName("Round").color = color;
    this.isDeth = false;
    this.beDeth = false;
    this.levelLabel = this.node
      .getChildByName("LevelLabel")
      .getComponent(cc.Label);
    this.moveDir = cc.Vec2.ZERO;
    this.boyManager = new BoyManager(this, this.game);

    this.boysNode = this.node.getChildByName("Boys");
    let visual = this.game.eatingNodePool.GetNode(this.visualNodePool);
    visual.setParent(this.node.getChildByName("Visual"));
    visual.setPosition(0, 0);
    this.node.getComponents(cc.CircleCollider).forEach((value) => {
      if (EatingGameConfig.ColliderTag.NEIYUAN == value.tag)
        value.radius =
          visual.height > visual.width ? visual.height / 2 : visual.width / 2;

    });
    // let boyCount = 4 + level;
    let boyCount = 5;
    if (!this.Ai) boyCount = 300;
    let a = Date.now();
    if (this.Ai) {
      for (let i = 0; i < boyCount; i++) {
        let newBoy = this.game.GetBoy();
        newBoy.setParent(this.game.node);
        newBoy.setPosition(
          newBoy.parent.convertToNodeSpaceAR(
            this.node.parent.convertToWorldSpaceAR(this.node.getPosition())
          )
        );
        let boy: Boy = newBoy.getComponent(Boy);
        boy.Init(this.game);
        this.boyManager.AddBoy(boy);
      }
    }
    // console.log("创造所有儿子的时间", Date.now() - a);
  }

  public GetLevel() {
    return this.roleLevel;
  }

  public SetLevel(level: number) {
    if (this.Ai) return;
    this.roleLevel = level;
  }

  public GetBoyManager() {
    return this.boyManager;
  }

  public onCollisionEnter(other: cc.Collider, self: cc.Collider) {
    let a = Date.now();
    if (EatingGameConfig.ColliderTag.WAIYUAN == self.tag) {
      switch (other.tag) {
        case EatingGameConfig.ColliderTag.boy:
          let boy = other.node.getComponent(Boy);
          if (boy.GetRole()) {
            if (
              !EatingUtil.GetAB(boy.GetRole().Ai, this.Ai) ||
              boy.GetRole() == this
            )
              return;
          } else {
            if (this.Ai) return;
          }
          this.eatingBoy.push(boy);
          break;
        case EatingGameConfig.ColliderTag.NEIYUAN:
          let role = other.node.getComponent(RoleBase);
          if (!EatingUtil.GetAB(role.Ai, this.Ai)) return;
          this.eatingRole.push(role);
          break;
      }
    }
  }

  public onCollisionExit(other: cc.Collider, self: cc.Collider) {
    let a = Date.now();
    if (EatingGameConfig.ColliderTag.WAIYUAN == self.tag) {
      switch (other.tag) {
        case EatingGameConfig.ColliderTag.boy:
          for (let i = 0; i < this.eatingBoy.length; i++) {
            if (this.eatingBoy[i] == other.node.getComponent("Boy"))
              this.eatingBoy.splice(i, 1);
          }
          break;
        case EatingGameConfig.ColliderTag.NEIYUAN:
          for (let i = 0; i < this.eatingRole.length; i++) {
            if (this.eatingRole[i] == other.node.getComponent("RoleBase"))
              this.eatingRole.splice(i, 1);
          }
          break;
      }
    }
  }

  private AiMove(dt) {
    if (this.game.isStoped()) return;
    if (this.aiMovePos.equals(cc.Vec2.ZERO)) {
      this.aiMovePos = this.game.GetInWallPos();
    }
    let pos = this.node.parent.convertToNodeSpaceAR(this.aiMovePos);
    let dir = pos.sub(this.node.getPosition()).normalize();
    this.node.setPosition(
      this.node.getPosition().add(dir.mul(dt * this.speed))
    );
    // this.node.setPosition(this.node.getPosition().add(dir.mul(dt * 100)));
    this.moveDir = dir;
    if (this.node.getPosition().sub(pos).mag() <= 20)
      this.aiMovePos = cc.Vec2.ZERO;
  }

  private UpdateRotation() {
    // if (this.Ai)
    //     console.log(this.moveDir.x, this.moveDir.y);
    if (cc.Vec2.ZERO.equals(this.moveDir)) return;
    let rotation = (this.moveDir.angle(cc.Vec2.UP) * 180) / Math.PI;
    if (this.moveDir.x < 0) {
      rotation = -rotation;
    }
    this.node.getChildByName("Visual").angle = -rotation;
    this.node.getChildByName("Round").angle = -rotation;
  }

  protected UpdateEat(dt: number) {
    let reset: boolean = false;
    if (this.eatingRole.length > 0) {
      this.eatingTime += dt;
      let roles: RoleBase[] = this.RoleEating();
      if (roles.length > 0) {
        if (this.eatingTime >= EatingGameConfig.maxEatingTime) {
          roles.forEach((value) => {
            let boy = value.GetBoyManager().GetBoy();
            if (boy) {
              // console.log("执行吃角色", this.game.dangqiandt, boy.GetRole(), this.id, roles.length);
              this.Eating(boy);
            } else if (value.Ai) {
              value.Death();
            } else {
              this.game.GameOver();
            }
          });
        }
        return;
      } else {
        reset = true;
      }
    }
    if (this.eatingBoy.length > 0) {
      this.eatingTime += dt;
      let boy: Boy = this.BoyEating();
      if (boy) {
        if (this.eatingTime >= EatingGameConfig.maxEatingTime) {
          // console.log("执行吃子", this.game.dangqiandt, boy.GetRole(), this.id, this);
          // this.game.LogRoles();
          this.Eating(boy);
        }
        return;
      } else {
        reset = true;
      }
    }
    if (reset) this.eatingTime = 0;
  }

  private BoyEating(): Boy {
    for (let i = this.eatingBoy.length - 1; i >= 0; i--) {
      let boy: Boy = this.eatingBoy[i];
      if (!boy.GetRole()) {
        if (!this.Ai) return boy;
      } else if (boy.GetRole().beEatingRole == this) return boy;
    }
    return null;
  }

  private RoleEating(): RoleBase[] {
    let roles: RoleBase[] = [];
    for (let i = 0; i < this.eatingRole.length; i++) {
      let role = this.eatingRole[i];
      if (role.beEatingRole == this) {
        roles.push(role);
      }
    }
    return roles;
  }

  private Eating(boy: Boy) {
    this.eatingTime = 0;
    if (boy.GetRole()) boy.GetRole().GetBoyManager().DeleteBoy(boy);
    if (this.Ai) {
      let a = Date.now();
      boy.BoyDead();
      // this.game.eatingNodePool.PutNode(nodePoolEnum.boy, boy.node);
      // console.log("执行PUT NODE耗时", Date.now() - a, this.game.dangqiandt, this.Ai);
    } else {
      this.boyManager.AddBoy(boy);
    }
    // this.game.eatingGameSounds.PlayEatingClip();
    if (!this.Ai) {
      let newAdd = cc.instantiate(this.game.addPrefab);
      newAdd.setParent(this.game.node);
      newAdd.setPosition(
        newAdd.parent.convertToNodeSpaceAR(
          boy.node.parent.convertToWorldSpaceAR(boy.node.getPosition())
        )
      );
      newAdd.zIndex = 100;
    }
  }

  public RoleDeath() {
    if (
      !this.game.cameraHolder.RoleInPlayerHorizons(this) &&
      null == this.game.player.beEatingRole
    ) {
      let boys = this.boyManager.GetBoys();
      if (boys.length > 0) {
        let a = Date.now();
        boys[0].BoyDead();
        // this.game.eatingNodePool.PutNode(nodePoolEnum.boy, boys[0].node);
        // console.log("将Boy放入节点池的时间", Date.now() - a, this.game.dangqiandt, this.Ai);
        // this.boyManager.DeleteBoy(boys[0]);
        return;
      } else {
        let b = Date.now();
        this.Death();
        // console.log("将Role放入节点池的时间", Date.now() - b, this.game.dangqiandt);
      }
    }
  }

  public Death() {
    this.isDeth = true;
    this.game.roleManager.DeleteRole(this);
    this.game.eatingNodePool.PutNode(
      this.visualNodePool,
      this.node.getChildByName("Visual").children[0]
    );
    this.game.eatingNodePool.PutNode(nodePoolEnum.role, this.node);
  }

  private UpdateRadius(dt: number) {
    if (null == this.boyManager || undefined == this.boyManager) return;
    this.node.getComponents(cc.CircleCollider).forEach((value) => {
      if (EatingGameConfig.ColliderTag.WAIYUAN == value.tag) {
        this.radius =
          this.boyManager.firshRoundR +
          10 +
          this.boyManager.roundR * (this.roleLevel - 1);
        let scale = (this.radius * 2 + 50) / 710;
        if (this.Ai) {
          value.radius = this.radius;
          this.node.getChildByName("Round").scale = scale;
          return;
        }
        value.radius = EatingUtil.Lerp(
          this.node.getComponent(cc.CircleCollider).radius,
          this.radius,
          dt
        );
        this.node.getChildByName("Round").scale = EatingUtil.Lerp(
          this.node.getChildByName("Round").scale,
          scale,
          dt
        );
      }
    });
  }

  lateUpdate(dt) {
    let a = Date.now();
    if (this.Ai) this.AiMove(dt);
    this.UpdateEat(dt);

    // if (dt > 0.033333)
    //     console.log("处理吃东西的时间", Date.now() - a, this.game.dangqiandt, "当前被吃的BOY长度", this.eatingBoy.length, "当前被吃的角色长度", this.eatingRole.length);
    this.UpdateRotation();
    this.UpdateRadius(dt);
    this.levelLabel.string = "lv " + this.roleLevel;
    // if (dt > 0.033333)
    //     console.log("rolebase update Time", Date.now() - a, this.game.dangqiandt);
  }
}
