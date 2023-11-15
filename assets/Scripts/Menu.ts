const {ccclass} = cc._decorator;

@ccclass
export default class Menu extends cc.Component {

    startBtnClicked(){
        cc.director.loadScene("Game")
    }

}
