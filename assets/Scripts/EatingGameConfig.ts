export default class EatingGameConfig {
  public static roleMoveSpeed = 300;
  public static boySpeed = 400;
  public static boyAcceleration = 1500;
  public static maxEatingTime = 0.05;
  public static bigPlayerRoleCount = 4;
  public static equalsPlayerRoleCount = 4;
  public static lessPlayerRoleOnt = 1;
  public static lessPlayerRoleCount = 2;
  public static maxEnemyRole =10;
  public static gameMaxBoy = 10;
  public static nodePoolInitCount = {
    boy: 2,
    role: 2,
    playerVisual: 2,
    enemyVisual: 2,
  };
  public static ColliderTag = {
    boy: 0, //boy
    WAIYUAN: 1, //外圆
    NEIYUAN: 2, //内圆
  };
}
