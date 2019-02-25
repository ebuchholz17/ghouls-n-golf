import {ActionGame} from "../action/ActionGame";
import {Flag} from "../action/ActionGame";
import {GameSettings} from "../settings/GameSettings";
import {Golf} from "../golf/Golf";
import {Player} from "../state/GameState";

export class WindArrow {
    public container: PIXI.Container;
    public mphText: PIXI.extras.BitmapText;
    public arrow: PIXI.Sprite;
}

export class ClubDisplay {
    public container: PIXI.Container;
    public club: PIXI.Sprite;
    public upArrow: PIXI.Sprite;
    public downArrow: PIXI.Sprite;
}

export class FlagCaptureDisplay {
    public container: PIXI.Container;
    public flagSprite: PIXI.Sprite;
    public flagBar: PIXI.Sprite;
    public targetWidth = 100;
}

export class PlayerUI {
    public container: PIXI.Container;

    public golfContainer: PIXI.Container;
    public actionContainer: PIXI.Container;
    private _clubDisplay: ClubDisplay;
    private _windArrow: WindArrow;
    public flagCaptureDisplay: FlagCaptureDisplay;

    private _hearts: PIXI.Sprite[];

    public constructor () {
        this.container = new PIXI.Container();

        this.golfContainer = new PIXI.Container();
        this.container.addChild(this.golfContainer);

        this.actionContainer = new PIXI.Container();
        this.container.addChild(this.actionContainer);

        this._windArrow = new WindArrow();
        this._windArrow.container = new PIXI.Container();
        this.golfContainer.addChild(this._windArrow.container);
        let mphText = new PIXI.extras.BitmapText("20mph", {
            font: "16px font"
        });
        (<PIXI.Point>mphText.anchor).set(0.5, 0.5)
        mphText.y = -16;
        this._windArrow.mphText = mphText;
        this._windArrow.container.addChild(mphText);
        let arrow = new PIXI.Sprite(GameSettings.textures["wind_arrow_diagonal"]);
        arrow.anchor.set(0.5, 0.5);
        arrow.y = 2;
        this._windArrow.arrow = arrow;
        this._windArrow.container.addChild(arrow);

        this._clubDisplay = new ClubDisplay();
        this._clubDisplay.container = new PIXI.Container();
        this.golfContainer.addChild(this._clubDisplay.container);

        let club = new PIXI.Sprite(GameSettings.textures["driver"]);
        club.anchor.set(0.5, 0.5);
        this._clubDisplay.club = club;
        this._clubDisplay.container.addChild(club);

        let upArrow = new PIXI.Sprite(GameSettings.textures["club_arrow"]);
        upArrow.anchor.set(0.5, 0.5);
        upArrow.y = -17;
        this._clubDisplay.upArrow = upArrow;
        this._clubDisplay.container.addChild(upArrow);

        let downArrow = new PIXI.Sprite(GameSettings.textures["club_arrow"]);
        downArrow.anchor.set(0.5, 0.5);
        downArrow.y = 10;
        downArrow.scale.y = -1;
        this._clubDisplay.downArrow = downArrow;
        this._clubDisplay.container.addChild(downArrow);

        this._hearts = [];
        for (let i = 0; i < 20; ++i) {
            let heart = new PIXI.Sprite(GameSettings.textures["heart"]);
            heart.anchor.set(0.5, 0.5);
            heart.visible = false;
            this.container.addChild(heart);
            this._hearts.push(heart);
        }

        this.flagCaptureDisplay = new FlagCaptureDisplay();
        this.flagCaptureDisplay.container = new PIXI.Container();
        this.actionContainer.addChild(this.flagCaptureDisplay.container);
        this.flagCaptureDisplay.flagBar = new PIXI.Sprite(GameSettings.textures["flagBar"]);
        this.flagCaptureDisplay.flagBar.x = 16;
        this.flagCaptureDisplay.container.addChild(this.flagCaptureDisplay.flagBar);
        this.flagCaptureDisplay.flagSprite = new PIXI.Sprite(GameSettings.textures["flagIcon"]);
        this.flagCaptureDisplay.container.addChild(this.flagCaptureDisplay.flagSprite);
    }

    public setWind (golf: Golf): void {
        switch (golf.windDirection) {
        case "N":
            this._windArrow.arrow.texture = GameSettings.textures["wind_arrow"];
            this._windArrow.arrow.rotation = -Math.PI / 2;
            break;
        case "NE":
            this._windArrow.arrow.texture = GameSettings.textures["wind_arrow_diagonal"];
            this._windArrow.arrow.rotation = 0;
            break;
        case "E":
            this._windArrow.arrow.texture = GameSettings.textures["wind_arrow"];
            this._windArrow.arrow.rotation = 0;
            break;
        case "SE":
            this._windArrow.arrow.texture = GameSettings.textures["wind_arrow_diagonal"];
            this._windArrow.arrow.rotation = Math.PI / 2;
            break;
        case "S":
            this._windArrow.arrow.texture = GameSettings.textures["wind_arrow"];
            this._windArrow.arrow.rotation = Math.PI / 2;
            break;
        case "SW":
            this._windArrow.arrow.texture = GameSettings.textures["wind_arrow_diagonal"];
            this._windArrow.arrow.rotation = Math.PI;
            break;
        case "W":
            this._windArrow.arrow.texture = GameSettings.textures["wind_arrow"];
            this._windArrow.arrow.rotation = Math.PI;
            break;
        case "NW":
            this._windArrow.arrow.texture = GameSettings.textures["wind_arrow_diagonal"];
            this._windArrow.arrow.rotation = -Math.PI / 2;
            break;
        }
        this._windArrow.mphText.text = golf.windMPH + "mph";
    }

    public update (player: Player): void {
        if (player.inActionGame) {
            this.golfContainer.visible = false;
            this.actionContainer.visible = true;

        }
        else {
            this.golfContainer.visible = true;
            this.actionContainer.visible = false;

            let clubType = player.golfer.currentClubType;
            switch(clubType) {
            default:
            case "driver":
                this._clubDisplay.club.texture = GameSettings.textures["driver"];
                break;
            case "iron":
                this._clubDisplay.club.texture = GameSettings.textures["iron"];
                break;
            case "wedge":
                this._clubDisplay.club.texture = GameSettings.textures["wedge"];
                break;
            case "putter":
                this._clubDisplay.club.texture = GameSettings.textures["putter"];
                break;
            }
        }
        let battleProps = player.character.battleProps;
        for (let i = 0; i < this._hearts.length; ++i) {
            let heart = this._hearts[i];
            heart.visible = false;
            if (i < battleProps.hitPoints) {
                heart.visible = true;
                heart.x = i * 11 + 8;
                heart.y = 7;
            }
        }
    }

    public updateFlag (flag:Flag): void {
        if (flag.owner == -1) {
            this.flagCaptureDisplay.container.visible = false;
        }
        else {
            this.flagCaptureDisplay.container.visible = true;
            if (flag.contested) {
                this.flagCaptureDisplay.flagBar.tint = 0x777777;
            }
            else {
                this.flagCaptureDisplay.flagBar.tint = flag.owner == 0 ? 0xff0000 : 0x0000ff;
            }
            this.flagCaptureDisplay.flagBar.width = (flag.progress / flag.progressMax) * this.flagCaptureDisplay.targetWidth;
            this.flagCaptureDisplay.flagBar.height = 8;
        }
    }

    public resize (screenWidth: number, screenHeight: number): void {
        this._windArrow.container.x = screenWidth - 15;
        this._windArrow.container.y = screenHeight - 16;

        this._clubDisplay.container.x = 15;
        this._clubDisplay.container.y = screenHeight - 14;

        this.flagCaptureDisplay.container.x = 0;
        this.flagCaptureDisplay.container.y = 128;
    }
}
