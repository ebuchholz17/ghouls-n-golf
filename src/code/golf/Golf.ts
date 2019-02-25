import {GameSettings} from "../settings/GameSettings";
import {Input} from "../Game";
import {Player} from "../state/GameState";
import {LevelType} from "../action/ActionGame";

enum ClubTypes {
    DRIVER = "driver"
}

enum GolferState {
    AIMING = "aiming",
    SWINGING = "swinging",
    WAITING = "waiting",
    WATCHING_BALL = "watchingBall",
    IN_GOLF_BALL = "inGolfBall",
    TRANSMITTING = "transmitting"
}

class BallTrajectory {
    public startPoint: PIXI.Point = new PIXI.Point(-1, -1);
    public endPoint: PIXI.Point = new PIXI.Point(-1, -1);
    public container: PIXI.Container;
    public dots: PIXI.Sprite[];
    public endDot: PIXI.Sprite;
    public dotProgress: number = 0;
    public angle: number = 0;

    public constructor (parentContainer: PIXI.Container) {
        this.container = new PIXI.Container();
        parentContainer.addChild(this.container);
        
        this.container.visible = false;
        this.dots = [];
        for (let i = 0; i < 8; ++i) {
            let dot = new PIXI.Sprite(GameSettings.textures["trajectory_dot"]);
            dot.anchor.set(0.5, 0.5);
            this.container.addChild(dot);
            this.dots.push(dot);
        }
        this.endDot = new PIXI.Sprite(GameSettings.textures["trajectory_dot"]);
        this.endDot.anchor.set(0.5, 0.5);
        this.container.addChild(this.endDot);
    }

    public update (dt: number): void {
        let trajectoryDiffX = this.endPoint.x - this.startPoint.x;
        let trajectoryDiffY = this.endPoint.y - this.startPoint.y;
        let dotDistanceX = trajectoryDiffX / this.dots.length;
        let dotDistanceY = trajectoryDiffY / this.dots.length;

        for (let i = 0; i < this.dots.length; ++i) {
            this.dots[i].x = dotDistanceX * i + dotDistanceX * this.dotProgress;
            this.dots[i].y = dotDistanceY * i + dotDistanceY * this.dotProgress;
        }
        this.endDot.x = trajectoryDiffX;
        this.endDot.y = trajectoryDiffY;
        this.dotProgress += 3 * dt;
        while (this.dotProgress > 1.0) {
            this.dotProgress -= 1.0;
        }
    }
}

export class Golfer {
    public pos: PIXI.Point = new PIXI.Point(-1, -1);
    public camera: PIXI.Point = new PIXI.Point(-1, -1);
    public color: string = "red";
    public cameraZoom: number = 1.0;

    public currentClubType: string;
    public sprite: PIXI.extras.AnimatedSprite;
    public ballTrajectory: BallTrajectory;
    public state: GolferState = GolferState.AIMING;
    public golfBall: GolfBall;
    public player: Player;
    public levelTerrainType: LevelType;
}

class GolfBall {
    public pos: PIXI.Point = new PIXI.Point(-1, -1);
    public sprite: PIXI.Sprite;
}

export class Golf {
    public container: PIXI.Container;
    private _courseData: PIXI.Sprite;
    private _courseMap: PIXI.Sprite;

    public windDirection: string;
    public windMPH: number;
    
    public golfers: Golfer[];
    private _golfballs: GolfBall[];
    private _coursePixelData: Uint8ClampedArray;

    private _courseStart: PIXI.Point = new PIXI.Point(27, 158);

    public constructor (renderer: any) {
        this.container = new PIXI.Container();

        this._courseMap = new PIXI.Sprite(GameSettings.textures["courseMap"]);
        this.container.addChild(this._courseMap);

        this._courseData = new PIXI.Sprite(GameSettings.textures["courseData"]);
        this._coursePixelData = renderer.extract.pixels(this._courseData);

        this.golfers = [];
        this._golfballs = [];
        for (let i = 0; i < GameSettings.numPlayers; ++i) {
            let golfer = new Golfer();
            let golferColor = i > 0 ? "blue" : "red";
            golfer.color= golferColor;
            let golferFrames = [];
            golferFrames.push(GameSettings.textures["golfer_" + golferColor + "_idle"]);
            for (let j = 0; j < 4; ++j) {
                golferFrames.push(GameSettings.textures["golfer_" + golferColor + "_swing_" + j]);
            }
            golfer.sprite = new PIXI.extras.AnimatedSprite(golferFrames);
            golfer.sprite.anchor.set(0.5, 1.0);
            golfer.sprite.animationSpeed = 0.2;
            golfer.sprite.loop = false;
            this.container.addChild(golfer.sprite);
            golfer.pos.x = this._courseStart.x - 6 + 12 * i;
            golfer.pos.y = this._courseStart.y;
            golfer.camera.x = golfer.pos.x;
            golfer.camera.y = golfer.pos.y;
            golfer.sprite.x = golfer.pos.x;
            golfer.sprite.y = golfer.pos.y;
            golfer.state = GolferState.AIMING;
            golfer.currentClubType = "driver";
            this.golfers.push(golfer);
        }
        for (let i = 0; i < GameSettings.numPlayers; ++i) {
            let golfer = this.golfers[i];
            golfer.ballTrajectory = new BallTrajectory(this.container);
        }
        for (let i = 0; i < GameSettings.numPlayers; ++i) {
            let golfball = new GolfBall();
            golfball.sprite = new PIXI.Sprite(GameSettings.textures["golf_ball_0"]);
            golfball.sprite.anchor.set(0.5, 0.5);
            this.container.addChild(golfball.sprite);
            let golfer = this.golfers[i];
            golfball.pos.x = golfer.pos.x;
            golfball.pos.y = golfer.pos.y;
            golfball.sprite.x = golfball.pos.x;
            golfball.sprite.y = golfball.pos.y;
            this._golfballs.push(golfball);
            golfer.golfBall = golfball;
        }

        let windDirections = [
            "N",
            "NE",
            "E",
            "SE",
            "S",
            "SW",
            "W",
            "NW"
        ];
        this.windDirection = windDirections[Math.floor(Math.random() * windDirections.length)];
        this.windMPH = Math.floor(Math.random() * 16);
    }

    public assignPlayer (player: Player, playerNum: number): void {
        player.golfer = this.golfers[playerNum];
        player.golfer.player = player;
    }

    public setCamera (playerNumber: number, screenHalfWidth: number, screenHalfHeight: number): void {
        // QQQ
        let camera = this.golfers[playerNumber].camera;
        let cameraZoom = this.golfers[playerNumber].cameraZoom;
        //this.container.x = Math.floor(screenHalfWidth - (camera.x * cameraZoom));
        //this.container.y = Math.floor(screenHalfHeight - (camera.y * cameraZoom));
        this.container.x = screenHalfWidth - (camera.x * cameraZoom);
        this.container.y = screenHalfHeight - (camera.y * cameraZoom);
        this.container.scale.set(cameraZoom, cameraZoom);
    }

    public enterGolfBall (golfer: Golfer): void {
        golfer.state = GolferState.IN_GOLF_BALL;
        golfer.player.enteringLevel = true;
        golfer.levelTerrainType = this.getTerrainType(golfer.golfBall.pos.x, golfer.golfBall.pos.y);
        golfer.cameraZoom = 1;
        let golferFrames = [];
        let golferColor = golfer.color;
        golferFrames.push(GameSettings.textures["golfer_" + golferColor + "_idle"]);
        for (let j = 0; j < 4; ++j) {
            golferFrames.push(GameSettings.textures["golfer_" + golferColor + "_swing_" + j]);
        }
        golfer.color = golferColor;
        golfer.sprite.textures = golferFrames;
        golfer.sprite.scale.set(1, 1);
        golfer.sprite.alpha = 1.0;
    }

    public exitGolfBall (golfer: Golfer, wonLevel: boolean): void {
        if (wonLevel) {
            golfer.pos.x = golfer.golfBall.pos.x;
            golfer.pos.y = golfer.golfBall.pos.y;
        }
        else {
            golfer.golfBall.pos.x = golfer.pos.x;
            golfer.golfBall.pos.y = golfer.pos.y;
        }
        golfer.sprite.x = golfer.pos.x;
        golfer.sprite.y = golfer.pos.y;
        golfer.golfBall.sprite.x = golfer.golfBall.pos.x;
        golfer.golfBall.sprite.y = golfer.golfBall.pos.y;
        golfer.sprite.gotoAndStop(0);

        this.updateTrajectoryEndpoint(golfer, this.getTerrainType(golfer.pos.x, golfer.pos.y), golfer.currentClubType);
        if (wonLevel) {
            golfer.state = GolferState.WAITING;
            let ballTrajectory = golfer.ballTrajectory;
            let updateCameraTween = new TWEEN.Tween(golfer.camera);
            updateCameraTween.to({x:ballTrajectory.endPoint.x, y:ballTrajectory.endPoint.y}, 333);
            updateCameraTween.easing(TWEEN.Easing.Quadratic.Out);
            updateCameraTween.onComplete(function () {
                golfer.state = GolferState.AIMING;
            }.bind(this));
            updateCameraTween.start();
        }
        else {
            golfer.state = GolferState.AIMING;
        }
    }

    public update (inputs: Input[], dt: number): void {
        let clubTypes = [
            "putter",
            "wedge",
            "iron",
            "driver"
        ];

        for (let i = 0; i < this.golfers.length; ++i) {
            let golfer = this.golfers[i];
            let input = inputs[i];
            switch (golfer.state) {
                default: 
                    console.log("shouldn't go in here");
                    break;
                case GolferState.IN_GOLF_BALL:
                    break;
                case GolferState.AIMING: {
                    let ballTrajectory = golfer.ballTrajectory;

                    if (input.rightIsDown) {
                        ballTrajectory.angle += 1.2 * dt;
                    }
                    else if (input.leftIsDown) {
                        ballTrajectory.angle -= 1.2 * dt; 
                    }

                    let clubIndex = clubTypes.indexOf(golfer.currentClubType);
                    if (input.upJustPressed) {
                        clubIndex--;
                        if (clubIndex < 0) {
                            clubIndex = clubTypes.length - 1;
                        }
                        golfer.currentClubType = clubTypes[clubIndex];
                    }
                    if (input.downJustPressed) {
                        clubIndex++;
                        if (clubIndex >= clubTypes.length) {
                            clubIndex = 0;
                        }
                        golfer.currentClubType = clubTypes[clubIndex];
                    }

                    ballTrajectory.container.visible = true;
                    ballTrajectory.container.x = golfer.pos.x;
                    ballTrajectory.container.y = golfer.pos.y;
                    this.updateTrajectoryEndpoint(golfer, 
                                                  this.getTerrainType(golfer.pos.x, golfer.pos.y), 
                                                  golfer.currentClubType);
                    ballTrajectory.update(dt);
                    golfer.camera.x = ballTrajectory.endPoint.x;
                    golfer.camera.y = ballTrajectory.endPoint.y;

                    if (input.jumpJustPressed) {
                        ballTrajectory.container.visible = false;
                        this.determineTrajectory(ballTrajectory, 1.0, 1.0, golfer.currentClubType);
                        golfer.state = GolferState.WAITING;
                        let cameraToGolferTween = new TWEEN.Tween(golfer.camera);
                        cameraToGolferTween.to({x: golfer.pos.x, y: golfer.pos.y}, 333);
                        cameraToGolferTween.easing(TWEEN.Easing.Quadratic.Out);
                        cameraToGolferTween.onComplete(function () {
                            golfer.state = GolferState.SWINGING;
                        }.bind(this));
                        cameraToGolferTween.start();
                    }
                } break;
                case GolferState.WAITING: 
                    break;
                case GolferState.SWINGING: {
                    // TODO(ebuchholz): do power meter here
                    golfer.state = GolferState.WAITING;
                    golfer.sprite.play();
                    golfer.golfBall.pos.x = golfer.ballTrajectory.endPoint.x; // TODO(ebuchholz): vary based on meter
                    golfer.golfBall.pos.y = golfer.ballTrajectory.endPoint.y;
                    golfer.sprite.onComplete = function () {
                        golfer.state = GolferState.WATCHING_BALL;
                        let golfBallTween = new TWEEN.Tween(golfer.golfBall.sprite); 
                        golfBallTween.to({x: golfer.golfBall.pos.x, y: golfer.golfBall.pos.y}, 2000);
                        golfBallTween.onUpdate(function (t: number) {
                            if (golfer.currentClubType == "putter") { return; }
                            let inc = 1.0 / 7;
                            if (t > 0 && t < inc * 1) {
                                golfer.golfBall.sprite.texture = GameSettings.textures["golf_ball_0"];
                            }
                            else if (t >= inc * 1 && t < inc * 2) {
                                golfer.golfBall.sprite.texture = GameSettings.textures["golf_ball_1"];
                            }
                            else if (t >= inc * 2 && t < inc * 3) {
                                golfer.golfBall.sprite.texture = GameSettings.textures["golf_ball_2"];
                            }
                            else if (t >= inc * 3 && t < inc * 4) {
                                golfer.golfBall.sprite.texture = GameSettings.textures["golf_ball_3"];
                            }
                            else if (t >= inc * 4 && t < inc * 5) {
                                golfer.golfBall.sprite.texture = GameSettings.textures["golf_ball_2"];
                            }
                            else if (t >= inc * 5 && t < inc * 6) {
                                golfer.golfBall.sprite.texture = GameSettings.textures["golf_ball_1"];
                            }
                            else if (t >= inc * 6) {
                                golfer.golfBall.sprite.texture = GameSettings.textures["golf_ball_0"];
                            }
                        }.bind(this));
                        golfBallTween.onComplete(function () {
                            this.doTransmissionAnimation(golfer);
                        }.bind(this));
                        golfBallTween.start();
                    }.bind(this);
                } break;
                case GolferState.TRANSMITTING:
                case GolferState.WATCHING_BALL: {
                    golfer.camera.x = golfer.golfBall.sprite.x;
                    golfer.camera.y = golfer.golfBall.sprite.y;
                } break;
            }
            //golfer.cameraZoom += 0.001;
        }
    }

    private doTransmissionAnimation (golfer: Golfer): void {
        golfer.sprite.textures = [GameSettings.textures["golfer_ghost"]];
        golfer.sprite.stop();
        golfer.sprite.alpha = 0.65;

        let scaleUpTween = new TWEEN.Tween(golfer.sprite.scale);
        scaleUpTween.to({x:1.15, y:1.15}, 133);
        scaleUpTween.delay(200);
        scaleUpTween.easing(TWEEN.Easing.Quadratic.Out);
        scaleUpTween.onComplete(function () {
            let scaleDownTween = new TWEEN.Tween(golfer.sprite.scale);
            scaleDownTween.to({x:1.0, y:1.0}, 133);
            scaleDownTween.easing(TWEEN.Easing.Quadratic.In);
            scaleDownTween.onComplete(function () {
                let ghostTween = new TWEEN.Tween(golfer.sprite);
                ghostTween.to({x: golfer.golfBall.sprite.x, y: golfer.golfBall.sprite.y}, 800);
                ghostTween.delay(333);
                ghostTween.onComplete(function () {
                    let cameraZoomTween = new TWEEN.Tween(golfer);
                    cameraZoomTween.to({cameraZoom: 6}, 500);
                    cameraZoomTween.delay(133);
                    cameraZoomTween.easing(TWEEN.Easing.Cubic.In);
                    cameraZoomTween.onComplete(function () {
                        this.enterGolfBall(golfer);
                    }.bind(this));
                    cameraZoomTween.start();
                }.bind(this));
                ghostTween.start();
            }.bind(this));
            scaleDownTween.start();
        }.bind(this));
        scaleUpTween.start();


    }

    private updateTrajectoryEndpoint (golfer: Golfer, terrainType: LevelType, clubType: string): void {
        let ballTrajectory = golfer.ballTrajectory;
        ballTrajectory.startPoint.x = golfer.pos.x;
        ballTrajectory.startPoint.y = golfer.pos.y;
        // TODO(ebuchholz): club types
        let hitDistance = 75;
        switch (clubType) {
            default:
            case "driver":
                hitDistance = 75;
                break;
            case "iron":
                hitDistance = 45;
                break;
            case "wedge":
                hitDistance = 20;
                break;
            case "putter":
                hitDistance = 10;
                break;
        }
        let distX = Math.cos(ballTrajectory.angle) * hitDistance;
        let distY = Math.sin(ballTrajectory.angle) * hitDistance;

        let terrainModifer = 1.0;
        switch (terrainType) {
            default:
                terrainModifer = 2.0;
                break;
            case LevelType.GREEN:
            case LevelType.FAIRWAY:
                terrainModifer = 1.0;
                break;
            case LevelType.ROUGH:
                terrainModifer = 0.7;
                break;
            case LevelType.BUNKER:
                if (clubType == "wedge") {
                    terrainModifer = 1.0;
                }
                else {
                    terrainModifer = 0.1;
                }
                break;
            case LevelType.WATER:
                terrainModifer = 0.5;
                break;
            case LevelType.OUT_OF_BOUNDS:
                terrainModifer = 0.4;
                break;
        }
        distX *= terrainModifer;
        distY *= terrainModifer;
        ballTrajectory.endPoint.x = ballTrajectory.startPoint.x + distX;
        ballTrajectory.endPoint.y = ballTrajectory.startPoint.y + distY;
    }

    private getTerrainType (x: number, y: number): LevelType {
        x = Math.floor(x);
        y = Math.floor(y);
        if (x > this._courseData.width || x < 0 || y > this._courseData.height || y < 0) { 
            return LevelType.OUT_OF_BOUNDS;
        }
        let offset = 4 * ((y * this._courseData.width) + x);
        let r = this._coursePixelData[offset];
        let g = this._coursePixelData[offset + 1];
        let b = this._coursePixelData[offset + 2];

        if (r == 0 && g == 232 && b == 12) { // fairway
            return LevelType.FAIRWAY;
        }
        else if (r == 0 && g == 232 && b == 93) { // green
            return LevelType.GREEN;
        }
        else if (r == 6 && g == 96 && b == 22) { // rough
            return LevelType.ROUGH;
        }
        else if (r == 255 && g == 218 && b == 106) { // bunker
            return LevelType.BUNKER;
        }
        else if (r == 0 && g == 162 && b == 232) { // water
            return LevelType.WATER;
        }
        else if (r == 2 && g == 32 && b == 7) { // out of bounds
            return LevelType.OUT_OF_BOUNDS;
        }
        return LevelType.OUT_OF_BOUNDS; // should never come here
    }

    private determineTrajectory (ballTrajectory: BallTrajectory, 
                                 powerModifier: number, accuracyModifier: number, clubType: string): void 
    {
        let diffX = ballTrajectory.endPoint.x - ballTrajectory.startPoint.x;
        let diffY = ballTrajectory.endPoint.y - ballTrajectory.startPoint.y;
         
        diffX *= powerModifier;
        diffY *= powerModifier;
        if (clubType != "putter") {
            let windAngle;
            switch (this.windDirection) {
            case "N":
                windAngle = -Math.PI/2;
                break;
            case "NE":
                windAngle = -Math.PI/4;
                break;
            case "E":
                windAngle = 0;
                break;
            case "SE":
                windAngle = Math.PI/4;
                break;
            case "S":
                windAngle = Math.PI/2;
                break;
            case "SW":
                windAngle = 3 * (Math.PI/4);
                break;
            case "W":
                windAngle = Math.PI;
                break;
            case "NW":
                windAngle = 5 * (Math.PI/4);
                break;
            }
            let windStrength = 30 * (this.windMPH / 30);
            diffX += Math.cos(windAngle) * windStrength;
            diffY += Math.sin(windAngle) * windStrength;
        }
        ballTrajectory.endPoint.x = ballTrajectory.startPoint.x + diffX;
        ballTrajectory.endPoint.y = ballTrajectory.startPoint.y + diffY;
    }

    public destroy (): void {
        this.container.destroy();
    }
}
