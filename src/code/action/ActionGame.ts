import {GameSettings} from "../settings/GameSettings";
import {Input} from "../Game";
import {Player} from "../state/GameState";
import {TileMapCollider} from "./TileMapCollider";

export class PlayerCharacter {
    public sprite: PIXI.extras.AnimatedSprite;
    public currentLevel: Level;
    public camera: PIXI.Point = new PIXI.Point();
    public cameraZoom: number = 1;

    public input: Input;

    public isDead: boolean = false;
    public isInvincible: boolean = false;
    public isInHitStun: boolean = false;
    public isAttacking: boolean = false;
    public isJumping: boolean = false;
    public hasJumpControl: boolean = false;
    public jumpTime: number = 0;
    public maxJumpTime: number = 0.25;
    public jumpButtonStillDown: boolean = false;
    public maxSpeed = 72;

    public playingGolf: boolean = true;
    public timeToLeaveTheLevel: boolean = false;
    public wonLevel: boolean = false;

    public moveProps: MovementProperties;
    public battleProps: BattleProperties;
    public collisionPoints: CollisionPoints;

    public facing: string = "right";
    public animationState: string = "standing";
    public lastAnimationState: string = "standing";

    public waitingToAppear: boolean = false;
    public respawning: boolean = false;

    public index: number = 1;
    public color: string = "red";
}

export class Flag {
    public sprite: PIXI.Sprite;
    public owner: number = -1;
    public contested: boolean = false;
    public progress: number = 0;
    public progressMax: number = 10;
}

export class MovementProperties {
    public position: PIXI.Point = new PIXI.Point();
    public velocity: PIXI.Point = new PIXI.Point();
    public baseSpeed: number = 0;
    public onGround: boolean = false;
    public noClip: boolean  = false;
    public bumpedHead: boolean = false;
    public ignoreGravity: boolean = false;
}

export class BattleProperties {
    public hitPoints: number;
    public attackPower: number;
    public hurtPos: PIXI.Point = new PIXI.Point();
    public hurtBox: PIXI.Rectangle = new PIXI.Rectangle();
    public debugHurtSprite: PIXI.Sprite = new PIXI.Sprite();
    public attacking: boolean = false;

    public cooldownDuration: number = 0;
    public cooldownRemaining: number = 0;

    public inHitStun: boolean = false;
    public hitStunDuration: number = 0;
    public hitStunTimer: number = 0;

    public isInvincible: boolean = false;
    public invincibleDuration: number = 0;
    public invincibleTimer: number = 0;
    
    public isDead: boolean = false;
}

export class Attack {
    public debugSprite: PIXI.Sprite;
    public position: PIXI.Point = new PIXI.Point();
    public hitbox: PIXI.Rectangle = new PIXI.Rectangle();
    public active: boolean = false;
    public owner: PlayerCharacter | Enemy;
    public timeRemaining: number = 0;
    public duration: number = 0;
}

export class Projectile {
    public sprite: PIXI.Sprite;
    public moveProps: MovementProperties;
    public attack: Attack; 
}

export class CollisionPoints {
    public top: PIXI.Point[] = [];
    public bottom: PIXI.Point[] = [];
    public left: PIXI.Point[] = [];
    public right: PIXI.Point[] = [];
}

enum EnemyType {
    GHOUL = "ghoul",
    GHOST = "ghost",
    SKELETON = "skeleton"
}

class Enemy {
    public sprite: PIXI.extras.AnimatedSprite;
    public moveProps: MovementProperties;
    public battleProps: BattleProperties;
    public collisionPoints: CollisionPoints;
    public isDead: boolean = false;
    public enemyProgress: number = 0;

    public touchAttack: Attack;

    public type: EnemyType = EnemyType.GHOUL;
    public moveTimer: number = 0;
    public moveDirection: string = "left";
    public startPoint: PIXI.Point;
}

class Tile {
    public key: string= "";
    public passable: boolean= true;
    public x: number = -1;
    public y: number = -1;
    public sprite: PIXI.Sprite;
}

export class TileMap {
    public container: PIXI.Container;
    public tiles: Tile[];
    public tilesByXY: Tile[][];
    public widthInTiles: number = 0;
    public heightInTiles: number = 0;

    public constructor () {
        this.container = new PIXI.Container();
        this.tiles = [];
        this.tilesByXY = [];
    }

    public destroy (): void{
        this.container.destroy();
    }
}

export enum LevelType {
    GREEN = "green",
    FAIRWAY = "fairway",
    ROUGH = "rough",
    BUNKER = "bunker",
    OUT_OF_BOUNDS = "outOfBounds",
    WATER = "water" // TODO(ebuchholz): implement
}

class Level {
    public container: PIXI.Container;
    public background: PIXI.Sprite;
    public levelContainer: PIXI.Container;
    public tileMap: TileMap;
    public players: PlayerCharacter[];
    public enemies: Enemy[];

    public attacks: Attack[];

    public _cameraMinX: number = 139;
    public cameraMaxX: number = 1340;

    public _cameraMinY: number = -500;
    public _cameraMaxY: number = 90;

    public levelWinX: number = 1472;

    public flag: Flag;
    public gameOver: boolean = false;

    public constructor () {
        this.container = new PIXI.Container();
    }

    public setCamera (playerCharacter: PlayerCharacter, 
                      screenHalfWidth: number, screenHalfHeight: number): void 
    {
        let camera = playerCharacter.camera;
        let cameraZoom = playerCharacter.cameraZoom;
        this.levelContainer.x = screenHalfWidth - (camera.x * cameraZoom);
        this.levelContainer.y = screenHalfHeight - (camera.y * cameraZoom);
        this.levelContainer.scale.set(cameraZoom, cameraZoom);
    }

    public update (dt: number) {
        // Process player input
        for (let i = 0; i < this.players.length; ++i) {
            let player = this.players[i];
            if (player.playingGolf) { continue; }
            let moveProps = player.moveProps;
            let battleProps = player.battleProps;
            let input = player.input;
            if (battleProps.isDead) {
                player.animationState = "dead";
            }
            else if (player.waitingToAppear) {
            }
            else {

                if (battleProps.inHitStun) {
                    player.isJumping = false;
                    player.hasJumpControl = false;
                    player.jumpTime = 0;
                    player.animationState = "hitStun";
                }
                else if (battleProps.attacking) {
                    if (moveProps.onGround) {
                        this.slowToStopOnGround(moveProps, dt);
                    }
                    player.animationState = "attacking";
                }
                else if (moveProps.onGround) {
                    player.isJumping = false;
                    player.hasJumpControl = false;
                    player.animationState = "standing";
                    if ((!input.leftIsDown && !input.rightIsDown) ||
                        (input.leftIsDown && input.rightIsDown)) {
                        player.animationState = "standing";
                        this.slowToStopOnGround(moveProps, dt);
                    }
                    else if (input.leftIsDown) {
                        player.facing = "left";
                        if (moveProps.velocity.x > 0) {
                            moveProps.velocity.x += -moveProps.baseSpeed * 2 * 60 * dt;
                        }
                        else {
                            moveProps.velocity.x += -moveProps.baseSpeed * 60 * dt;
                        }
                        if (moveProps.velocity.x < -player.maxSpeed) {
                            moveProps.velocity.x = -player.maxSpeed;
                        }
                        player.animationState = "walking";
                        player.facing = "left";
                    }
                    else if (input.rightIsDown) {
                        player.facing = "right";
                        if (moveProps.velocity.x < 0) {
                            moveProps.velocity.x +=moveProps.baseSpeed * 2 * 60 * dt;
                        }
                        else {
                            moveProps.velocity.x +=moveProps.baseSpeed * 60 * dt;
                        }
                        if (moveProps.velocity.x > player.maxSpeed) {
                            moveProps.velocity.x = player.maxSpeed;
                        }
                        player.animationState = "walking";
                        player.facing = "right";
                    }
                    if (input.jumpJustPressed) {
                        player.animationState = "jumping";
                        moveProps.velocity.y = -100;
                        moveProps.onGround = false;
                        player.jumpTime = 0;
                        player.isJumping = true;
                        player.hasJumpControl = true;
                        player.jumpButtonStillDown = true;
                    }
                    else {
                        player.jumpButtonStillDown = false;
                    }
                }
                else{        
                    if (player.isJumping) {
                        if (moveProps.bumpedHead) {
                            player.hasJumpControl = false;
                            moveProps.velocity.y = 1;
                        }

                        if (player.hasJumpControl && input.jumpIsDown) {
                            moveProps.velocity.y -= 8 * dt* 60;
                            player.jumpTime += dt;
                            if (player.jumpTime > player.maxJumpTime) {
                                player.hasJumpControl = false;
                            }
                        }
                        else if (player.hasJumpControl) {
                            if (moveProps.velocity.y < 0) { moveProps.velocity.y *= 0.3 * 60 * dt; }
                            player.hasJumpControl = false;
                            player.jumpButtonStillDown = false;
                        }
                    }
                    else {
                        player.animationState = "falling"; 
                    }

                    if (input.leftIsDown) {
                        moveProps.velocity.x += -moveProps.baseSpeed * 0.5 * 60 * dt;
                        if (moveProps.velocity.x < -player.maxSpeed) {
                            moveProps.velocity.x = -player.maxSpeed;
                        }
                    }
                    if (input.rightIsDown) {
                        moveProps.velocity.x += moveProps.baseSpeed * 0.5 * 60 * dt;
                        if (moveProps.velocity.x > player.maxSpeed) {
                            moveProps.velocity.x = player.maxSpeed;
                        }
                    }
                }
                if (!battleProps.attacking && input.attackJustPressed) {
                    battleProps.attacking = true;

                    let hitboxWidth = 14;
                    let hitboxHeight = 10;
                    let offset = player.facing == "right" ? 6 : -6 - hitboxWidth;
                    let attackX = moveProps.position.x + offset;
                    let attackY = moveProps.position.y - 10;
                    this.spawnAttack(player, 0.1, attackX, attackY, 0, 0, hitboxWidth, hitboxHeight);
                }
            }
            // TODO(ebuchholz): maybe do this for monsters as well
            let remainingDT = dt;
            while (remainingDT > 0) {
                remainingDT -= 0.008;
                let tempDT = 0.008;
                if (remainingDT < 0) {
                    tempDT = remainingDT + tempDT;
                }
                this.updateMovement(moveProps, tempDT);
                TileMapCollider.handleCollisions(this.tileMap, player.collisionPoints, moveProps);
            }
            this.updateBattleTimers(battleProps, dt);
            this.updateHurtboxPosition(moveProps, battleProps);
            this.updatePlayerAnimations(player);

            player.sprite.x = moveProps.position.x;
            player.sprite.y = moveProps.position.y;
            if (!player.battleProps.isDead) {
                player.camera.x = moveProps.position.x;
                if (player.camera.x < this._cameraMinX) { player.camera.x = this._cameraMinX; }
                if (player.camera.x > this.cameraMaxX) { player.camera.x = this.cameraMaxX; }
                player.camera.y = moveProps.position.y;
                if (player.camera.y < this._cameraMinY) { player.camera.y = this._cameraMinY; }
                if (player.camera.y > this._cameraMaxY) { player.camera.y = this._cameraMaxY; }
            }

            if (!player.battleProps.isDead && moveProps.position.x > this.levelWinX) {
                player.playingGolf = true;
                player.timeToLeaveTheLevel = true;
                player.wonLevel = true;
            }

        }
        // update monsters
        for (let i = 0; i < this.enemies.length; ++i) {
            let enemy = this.enemies[i];
            let moveProps = enemy.moveProps;
            let battleProps = enemy.battleProps;
            enemy.sprite.x = moveProps.position.x;
            enemy.sprite.y = moveProps.position.y;
            this.updateMovement(moveProps, dt);
            this.updateMonsterTouchAttack(enemy);
            this.updateBattleTimers(battleProps, dt);
            this.updateHurtboxPosition(moveProps, battleProps);
            TileMapCollider.handleCollisions(this.tileMap, enemy.collisionPoints, moveProps);

            switch (enemy.type) {
                case EnemyType.GHOUL: 
                    this.ghoulAI(enemy, dt);
                    break;
                case EnemyType.SKELETON: 
                    this.skeletonAI(enemy, dt);
                    break;
                case EnemyType.GHOST: 
                    this.ghostAI(enemy, dt);
                    break;
            }
        }

        // update attacks
        for (let i = this.attacks.length - 1; i >= 0; --i) {
            let attack = this.attacks[i];
            // loop against players and monsters and damage them if possible
            for (let i = 0; i < this.players.length; ++i) {
                let player = this.players[i];
                this.testAttack(player, attack, player.moveProps, player.battleProps);
                if (player.battleProps.isDead && !player.respawning) {
                    this.respawnCharacterTimerStart(player);
                }
            }
            for (let i = 0; i < this.enemies.length; ++i) {
                let enemy = this.enemies[i];
                this.testAttack(enemy, attack, enemy.moveProps, enemy.battleProps);
            }

            if (attack.duration == -1) {
                attack.timeRemaining = 1000; // never ends
            }
            else {
                attack.timeRemaining -= dt;
            }
            if (attack.timeRemaining <= 0) {
                if (attack.debugSprite) {
                    this.levelContainer.removeChild(attack.debugSprite);
                    attack.debugSprite.destroy();
                }
                this.attacks.splice(i, 1);
            }
        }

        // update flag timer
        if (this.flag) {
            if (GameSettings.numPlayers == 1) {
                if (this.players[0] && Math.abs(this.players[0].moveProps.position.x - this.flag.sprite.x) < 8) {
                    this.gameOver = true;
                    GameSettings.winningPlayer = 1;
                }
            }
            else {
                let playerNearFlag;
                let newOwner = -1;
                let newContester = -1;
                let numPlayersNearFlag = 0;
                let ownerNearFlag = false;
                let flag = this.flag;
                flag.contested = false;
                for (let i = 0; i < this.players.length; ++i) {
                    let player = this.players[i];
                    if (Math.abs(player.moveProps.position.x - this.flag.sprite.x) < 32) { 
                        numPlayersNearFlag ++; 
                        if (flag.owner == -1) {
                            flag.owner = player.index;
                            ownerNearFlag = true;
                        }
                        else if (player.index == flag.owner) {
                            ownerNearFlag = true;
                        }
                    }
                }

                if (flag.owner != -1 && !ownerNearFlag) {
                    flag.progress -= dt;
                    if (flag.progress < 0) {
                        flag.owner = -1;
                        flag.progress = 0;
                    }
                }
                else if (flag.owner != -1 && ownerNearFlag) {
                    if (numPlayersNearFlag > 1) {
                        flag.contested = true;
                    }
                    else {
                        flag.progress += dt;
                        if (flag.progress > flag.progressMax) {
                            this.gameOver = true;
                            GameSettings.winningPlayer = flag.owner + 1;
                        }
                    }
                }
                else if (flag.owner == -1) {
                    flag.progress -= dt;
                    if (flag.progress < 0) {
                        flag.owner = -1;
                        flag.progress = 0;
                    }
                }
            }
        }
    }

    public possessGolfBall (player: PlayerCharacter): void {
        let playerGhost = new PIXI.Sprite(GameSettings.textures["golfer_ghost"]);
        playerGhost.anchor.set(0.5, 0.5);
        this.levelContainer.addChild(playerGhost);
        playerGhost.x = player.sprite.x;
        playerGhost.y = player.sprite.y;
        playerGhost.scale.set(3, 3);
        playerGhost.alpha = 0.5;

        let playerGhostTween = new TWEEN.Tween(playerGhost.scale);
        playerGhostTween.to({x: 0.5, y: 0.5}, 500);
        playerGhostTween.easing(TWEEN.Easing.Quadratic.Out);
        playerGhostTween.onComplete(function () {
            playerGhost.visible = false;
            player.animationState = "appearing";

            let appearTimer = new TWEEN.Tween();
            appearTimer.to({}, 300);
            appearTimer.onComplete(function () {
                player.waitingToAppear = false;
            }.bind(this));
            appearTimer.start();

        }.bind(this));
        playerGhostTween.start();


    }

    public updatePlayerAnimations (player: PlayerCharacter): void {
        let playerStandingSprites = [
            GameSettings.textures["golfman"]
        ];
        let playerAttackingSprites = [
            GameSettings.textures["golfman_punch"]
        ];
        let playerRunningSprites = [
            GameSettings.textures["golfman_run_0"],
            GameSettings.textures["golfman_run_0"],
            GameSettings.textures["golfman"],
            GameSettings.textures["golfman_run_1"],
            GameSettings.textures["golfman_run_1"],
            GameSettings.textures["golfman"]
        ];
        let playerAppearingSprites = [
            GameSettings.textures["golfman_appear_0"],
            GameSettings.textures["golfman_appear_1"],
            GameSettings.textures["golfman_appear_2"],
            GameSettings.textures["golfman"]
        ];
        let playerDeadHitStunSprites = [
            GameSettings.textures["golfman_run_1"]
        ];
        let playerJumpingSprites = [
            GameSettings.textures["golfman_run_0"]
        ];
        let playerFallingSprites = [
            GameSettings.textures["golfman_run_1"]
        ];
        let playerWaitingSprites = [
            GameSettings.textures["golfman_appear_0"]
        ];

        if (player.animationState != player.lastAnimationState) {
            switch (player.animationState) {
                case "standing":
                    player.sprite.textures = playerStandingSprites;
                    player.sprite.stop();
                    break;
                case "walking":
                    player.sprite.textures = playerRunningSprites;
                    player.sprite.play();
                    player.sprite.animationSpeed = 0.3;
                    player.sprite.loop = true;
                    break;
                case "attacking":
                    player.sprite.textures = playerAttackingSprites;
                    player.sprite.stop();
                    break;
                case "hitStun":
                    player.sprite.textures = playerDeadHitStunSprites;
                    player.sprite.stop();
                    break;
                case "dead":
                    player.sprite.textures = playerDeadHitStunSprites;
                    player.sprite.stop();
                    break;
                case "jumping":
                    player.sprite.textures = playerJumpingSprites;
                    player.sprite.stop();
                    break;
                case "falling":
                    player.sprite.textures = playerFallingSprites;
                    player.sprite.stop();
                    break;
                case "appearing":
                    player.sprite.textures = playerAppearingSprites;
                    player.sprite.play();
                    player.sprite.animationSpeed = 0.3;
                    player.sprite.loop = false;
                    break;
                case "waiting":
                    player.sprite.textures = playerWaitingSprites;
                    player.sprite.stop();
                    break;
            }
        }
        if (player.facing == "right") {
            player.sprite.scale.x = 1;
        }
        else {
            player.sprite.scale.x = -1;
        }

        if (player.battleProps.isInvincible) {
            player.sprite.alpha = 0.5;
        }
        else {
            player.sprite.alpha = 1.0;
        }
        
        player.lastAnimationState = player.animationState;
    }

    public intersects (a: PIXI.Rectangle, b: PIXI.Rectangle): boolean {
        if (a.x + a.width < b.x || a.x > b.x + b.width) { return false; }
        if (a.y + a.height < b.y || a.y > b.y + b.height) { return false; }
        return true;
    }

    public testAttack (testEntity: PlayerCharacter | Enemy, attack: Attack,
                       moveProps: MovementProperties, battleProps: BattleProperties): void 
    {
        if (battleProps.isDead) { return; }

        let globalHurtbox = new PIXI.Rectangle();
        let globalHitbox = new PIXI.Rectangle();

        if (attack.owner == testEntity) { return; }
        if (battleProps.isInvincible) { return; }
        globalHurtbox.x = battleProps.hurtBox.x + battleProps.hurtPos.x;
        globalHurtbox.y = battleProps.hurtBox.y + battleProps.hurtPos.y;
        globalHurtbox.width = battleProps.hurtBox.width;
        globalHurtbox.height = battleProps.hurtBox.height;

        globalHitbox.x = attack.hitbox.x + attack.position.x;
        globalHitbox.y = attack.hitbox.y + attack.position.y;
        globalHitbox.width = attack.hitbox.width;
        globalHitbox.height = attack.hitbox.height;

        if (this.intersects(globalHitbox, globalHurtbox)) {
            let direction = globalHurtbox.x - globalHitbox.x < 0 ? 1 : -1;
            this.handleAttackHit(moveProps, battleProps, direction);
        }
    }

    public handleAttackHit (moveProps: MovementProperties, battleProps: BattleProperties, 
                            direction: number): void 
    {
        battleProps.inHitStun = true;
        battleProps.isInvincible = true;
        moveProps.velocity.y = -75;
        moveProps.velocity.x = -75 * direction;
        moveProps.onGround = false;

        battleProps.hitPoints -= 1; // TODO(ebuchholz): variable damage
        if (battleProps.hitPoints <= 0) {
            battleProps.isDead = true;
            moveProps.noClip = true;
        }
    }

    public respawnCharacterTimerStart (player: PlayerCharacter): void {
        player.respawning = true;
        let respawnTimer = new TWEEN.Tween();
        respawnTimer.to({}, 1500);
        respawnTimer.onComplete(function () {
            player.playingGolf = true;
            player.timeToLeaveTheLevel = true;
            player.wonLevel = false;
        }.bind(this));
        respawnTimer.start();
    }

    public updateHurtboxPosition (moveProps: MovementProperties, battleProps: BattleProperties): void {
        let hurtbox = battleProps.hurtBox;
        battleProps.hurtPos.x = moveProps.position.x;
        battleProps.hurtPos.y = moveProps.position.y;

        let debugSprite = battleProps.debugHurtSprite;
        if (debugSprite) {
            debugSprite.x = battleProps.hurtPos.x + hurtbox.x;
            debugSprite.y = battleProps.hurtPos.y + hurtbox.y;
            debugSprite.width = hurtbox.width;
            debugSprite.height = hurtbox.height;
        }
    }

    public updateMonsterTouchAttack (enemy: Enemy): void {
        let attack = enemy.touchAttack;
        attack.position.x = enemy.moveProps.position.x;
        attack.position.y = enemy.moveProps.position.y;

        let debugSprite = attack.debugSprite;
        if (debugSprite) {
            debugSprite.x = attack.position.x + attack.hitbox.x;
            debugSprite.y = attack.position.y + attack.hitbox.y;
            debugSprite.width = attack.hitbox.width;
            debugSprite.height = attack.hitbox.height;
        }
    }

    public updateBattleTimers (battleProps: BattleProperties, dt: number): void{
        if (battleProps.isDead) { return; }

        if (battleProps.attacking) {
            battleProps.cooldownRemaining -= dt;
            if (battleProps.cooldownRemaining <= 0) {
                battleProps.cooldownRemaining = battleProps.cooldownDuration;
                battleProps.attacking = false;
            }
        }
        if (battleProps.inHitStun) {
            battleProps.hitStunTimer -= dt;
            if (battleProps.hitStunTimer <= 0) {
                battleProps.hitStunTimer = battleProps.hitStunDuration;
                battleProps.inHitStun = false;
            }
        }
        if (battleProps.isInvincible) {
            battleProps.invincibleTimer -= dt;
            if (battleProps.invincibleTimer <= 0) {
                battleProps.invincibleTimer = battleProps.invincibleDuration;
                battleProps.isInvincible = false;
            }
        }
    }

    public slowToStopOnGround (moveProps: MovementProperties, dt: number) : void {
        if (moveProps.velocity.x > 0) {
            moveProps.velocity.x -= 20 * 60 * dt;
            if (moveProps.velocity.x < 0) {
                moveProps.velocity.x = 0;
            }
        }
        else if (moveProps.velocity.x < 0) {
            moveProps.velocity.x += 20 * 60 * dt;
            if (moveProps.velocity.x > 0) {
                moveProps.velocity.x = 0;
            }
        }
    }

    public spawnAttack (owner: PlayerCharacter | Enemy, duration: number, 
        x: number, y: number,
        hitboxX: number, hitboxY: number, 
        hitboxWidth: number, hitboxHeight: number): Attack 
    {
        let attack = new Attack();
        attack.owner = owner;
        attack.duration = duration;
        attack.timeRemaining = attack.duration;
        attack.hitbox.x = hitboxX;
        attack.hitbox.y = hitboxY;
        attack.hitbox.width = hitboxWidth;
        attack.hitbox.height = hitboxHeight;
        attack.position.x = x;
        attack.position.y = y;
        attack.active = true;
        if (GameSettings.showHitBoxes) {
            let debugSprite = new PIXI.Sprite(GameSettings.textures["hitbox"]);
            debugSprite.x = attack.position.x + attack.hitbox.x;
            debugSprite.y = attack.position.y + attack.hitbox.y;
            debugSprite.width = attack.hitbox.width;
            debugSprite.height = attack.hitbox.height;
            this.levelContainer.addChild(debugSprite);
            attack.debugSprite = debugSprite;
        }
        this.attacks.push(attack);
        return attack;
    }

    private ghoulAI (enemy: Enemy, dt: number): void {
        if (enemy.battleProps.inHitStun) {

        }
        else {
            if (enemy.moveDirection == "left") {
                enemy.sprite.scale.x = 1;
                enemy.moveProps.velocity.x = -15.0;
            }
            else if (enemy.moveDirection == "right") {
                enemy.sprite.scale.x = -1;
                enemy.moveProps.velocity.x = 15.0;
            }
            enemy.moveTimer += dt;
            let maxMoveTime = 1.5;
            if (enemy.moveTimer > maxMoveTime) {
                if (enemy.moveDirection == "right"){
                    enemy.moveDirection = "left";
                }
                else if (enemy.moveDirection == "left"){
                    enemy.moveDirection = "right";
                }
                enemy.moveTimer -= maxMoveTime;
            }
        }
    }

    private skeletonAI (enemy: Enemy, dt: number): void {
        if (enemy.battleProps.inHitStun) {

        }
        else {
            if (enemy.moveProps.onGround) {
                if (enemy.moveDirection == "left") {
                    enemy.moveDirection = "right";
                    enemy.sprite.scale.x = 1;
                    enemy.moveProps.velocity.x = -20.0;
                }
                else if (enemy.moveDirection == "right") {
                    enemy.moveDirection = "left";
                    enemy.sprite.scale.x = -1;
                    enemy.moveProps.velocity.x = 20.0;
                }
                enemy.moveProps.velocity.y = -150;
                enemy.moveProps.onGround = false;
            }
        }
    }

    private ghostAI (enemy: Enemy, dt: number): void {
        enemy.moveProps.noClip = true;
        enemy.moveProps.ignoreGravity = true;
        enemy.enemyProgress += dt;
        if (enemy.battleProps.inHitStun) {
            enemy.moveProps.ignoreGravity = false;
            enemy.startPoint.x = enemy.moveProps.position.x;
            enemy.startPoint.y = enemy.moveProps.position.y;
            enemy.enemyProgress = 0;
        }
        if (enemy.battleProps.isDead) {
            enemy.moveProps.ignoreGravity = false;
            enemy.moveProps.noClip = true;
        }
        if (!enemy.battleProps.inHitStun) {
            enemy.moveProps.position.x = enemy.startPoint.x + 48 * (1 - Math.cos(enemy.enemyProgress));
            enemy.moveProps.position.y = enemy.startPoint.y + 48 * Math.sin(enemy.enemyProgress);
        }
    }

    private updateMovement (moveProps: MovementProperties, dt: number): void{
        if (!moveProps.onGround && !moveProps.ignoreGravity) {
            moveProps.velocity.y += 8.0 * 60 * dt;
        }
        else {
            moveProps.velocity.y = 0;
        }

        if (moveProps.velocity.y > 479) {
            moveProps.velocity.y = 479;
        }

        if (Math.abs(moveProps.velocity.x) < 0.01) {
            moveProps.velocity.x = 0;
        }
        if (Math.abs(moveProps.velocity.y) < 0.01) {
            moveProps.velocity.y = 0;
        }

        moveProps.position.x += moveProps.velocity.x * dt;
        moveProps.position.y += moveProps.velocity.y * dt;

    }

    public destroy (): void {
        this.container.destroy();
    }
}

export class ActionGame {
    public container: PIXI.Container;
    public levels: Level[];
    public playerCharacters: PlayerCharacter[];
    public greenLevel: Level;
    public gameOver: boolean = false;

    public constructor () {
        this.container = new PIXI.Container();
        this.levels = [];
        this.greenLevel = this.generateLevel(LevelType.GREEN);

        // addflag to green level
        let flag = new Flag();
        this.greenLevel.flag = flag;
        flag.sprite = new PIXI.Sprite(GameSettings.textures["flag"]);
        flag.sprite.anchor.set(1.0, 1.0);
        flag.sprite.x = 500;
        flag.sprite.y = 144;
        this.greenLevel.levelContainer.addChild(this.greenLevel.flag.sprite);

        this.playerCharacters = [];
        for (let i = 0; i < GameSettings.numPlayers; ++i) {
            let player = new PlayerCharacter();
            player.index = i;
            player.color = i == 0 ? "red" : "blue";
            player.sprite = new PIXI.extras.AnimatedSprite([GameSettings.textures["golfman_appear_0"]]);
            player.sprite.anchor.set(0.5, 0.5);
            player.moveProps = new MovementProperties();
            player.moveProps.position.x = 234; // QQQ
            player.moveProps.position.y = 122;
            player.moveProps.baseSpeed = 10;

            player.battleProps = new BattleProperties();
            player.battleProps.hitPoints = 5;
            player.battleProps.attackPower = 1;
            player.battleProps.attacking = false;
            player.battleProps.cooldownDuration = 0.2;
            player.battleProps.cooldownRemaining = player.battleProps.cooldownDuration;
            player.battleProps.hitStunDuration = 0.3;
            player.battleProps.hitStunTimer = player.battleProps.hitStunDuration;
            player.battleProps.invincibleDuration = 0.5;
            player.battleProps.invincibleTimer = player.battleProps.invincibleDuration;
            let hurtBox = player.battleProps.hurtBox;
            hurtBox.x = -9;
            hurtBox.y = -10;
            hurtBox.width = 18;
            hurtBox.height = 20;
            if (GameSettings.showHitBoxes) {
                let hurtSprite = new PIXI.Sprite(GameSettings.textures["hurtbox"]);
                hurtSprite.x = player.moveProps.position.x + hurtBox.x;
                hurtSprite.y = player.moveProps.position.y + hurtBox.y;
                hurtSprite.width = hurtBox.width;
                hurtSprite.height= hurtBox.height;
                player.battleProps.debugHurtSprite = hurtSprite;
            }

            player.collisionPoints = new CollisionPoints();
            player.collisionPoints.left.push(new PIXI.Point(-5, 5));
            player.collisionPoints.left.push(new PIXI.Point(-5, -8));
            player.collisionPoints.right.push(new PIXI.Point(5, 5));
            player.collisionPoints.right.push(new PIXI.Point(5, -8));
            player.collisionPoints.bottom.push(new PIXI.Point(-4, 12));
            player.collisionPoints.bottom.push(new PIXI.Point(4, 12));
            player.collisionPoints.top.push(new PIXI.Point(-4, -10));
            player.collisionPoints.top.push(new PIXI.Point(4, -10));
            this.playerCharacters.push(player);
        }
    }

    public assignPlayer (player: Player, playerNum: number): void {
        player.character = this.playerCharacters[playerNum];
    }

    public generateLevel (levelType: LevelType): Level {
        let level = new Level();

        level.container = new PIXI.Container();
        this.container.addChild(level.container);

        level.levelContainer= new PIXI.Container();
        level.container.addChild(level.levelContainer);

        level.players = [];
        level.enemies = [];
        level.attacks = [];

        this.levels.push(level);

        let tileMap = new TileMap();

        let possibleLevels;
        let spriteKeys;
        let levelData;
        switch (levelType) {
            case LevelType.WATER:
                level.levelWinX = 485;
                possibleLevels = [
                    require("../../data/bunker_1.txt"),
                    require("../../data/bunker_2.txt"),
                ];
                spriteKeys = {
                    "X": "bunker",
                    "u": "bunker_up",
                    "d": "bunker_down",
                    "l": "bunker_left",
                    "r": "bunker_right",
                    "s": "bunker_downleft",
                    "e": "bunker_downright",
                    "w": "bunker_upleft",
                    "n": "bunker_upright"
                };
                break;
            case LevelType.FAIRWAY:
                level.levelWinX = 1070;
                possibleLevels = [
                    require("../../data/fairway_1.txt"),
                    require("../../data/fairway_2.txt"),
                    require("../../data/fairway_3.txt"),
                ];
                spriteKeys = {
                    "X": "fairway",
                    "u": "fairway_up",
                    "d": "fairway_down",
                    "l": "fairway_left",
                    "r": "fairway_right",
                    "s": "fairway_downleft",
                    "e": "fairway_downright",
                    "w": "fairway_upleft",
                    "n": "fairway_upright"
                };
                break;
            case LevelType.BUNKER:
                level.levelWinX = 485;
                possibleLevels = [
                    require("../../data/bunker_1.txt"),
                    require("../../data/bunker_2.txt"),
                ];
                spriteKeys = {
                    "X": "bunker",
                    "u": "bunker_up",
                    "d": "bunker_down",
                    "l": "bunker_left",
                    "r": "bunker_right",
                    "s": "bunker_downleft",
                    "e": "bunker_downright",
                    "w": "bunker_upleft",
                    "n": "bunker_upright"
                };
                break;
            case LevelType.GREEN:
                level.levelWinX = 1370;
                levelData = require("../../data/green.txt")
                spriteKeys = {
                    "X": "green_0",
                    "x": "green_1",
                    "u": "green_up",
                };
                break;
            case LevelType.ROUGH:
                level.levelWinX = 730;
                possibleLevels = [
                    require("../../data/rough_1.txt"),
                    require("../../data/rough_2.txt"),
                ];
                spriteKeys = {
                    "X": "rough",
                    "u": "rough_up",
                    "d": "rough_down",
                    "l": "rough_left",
                    "r": "rough_right",
                    "s": "rough_downleft",
                    "e": "rough_downright",
                    "w": "rough_upleft",
                    "n": "rough_upright"
                };
                break;
            case LevelType.OUT_OF_BOUNDS:
                level.levelWinX = 480;
                possibleLevels = [
                    require("../../data/oob_1.txt"),
                    require("../../data/oob_2.txt"),
                ];
                spriteKeys = {
                    "X": "oob",
                    "u": "oob_up",
                    "d": "oob_down",
                    "l": "oob_left",
                    "r": "oob_right",
                    "s": "oob_downleft",
                    "e": "oob_downright",
                    "w": "oob_upleft",
                    "n": "oob_upright"
                };
                break;
        }
        level.cameraMaxX = level.levelWinX - 130;
        if (GameSettings.numPlayers > 1) {
            level.levelWinX -= 62;
        }

        if (!levelData) {
            levelData = possibleLevels[Math.floor(Math.random() * possibleLevels.length)];
        }
        let rows = levelData.match(/[^\r\n]+/g);
        tileMap.widthInTiles = rows[0].length;
        tileMap.heightInTiles = rows.length;
        tileMap.container = new PIXI.Container();
        level.levelContainer.addChild(tileMap.container);
        level.tileMap = tileMap;

        for (let j = 0; j < tileMap.widthInTiles; ++j) {
            tileMap.tilesByXY[j] = [];
        }

        let unpassableTiles = "Xxudlrnsew";
        let monsterKeys = "GSH";
        for (let i =0; i < rows.length; ++i) {
            for (let j =0; j < rows[i].length; ++j) {
                let key = rows[i][j];
                if (key == "-") { continue; }
                if (~monsterKeys.indexOf(key)) {
                    let enemy = new Enemy();

                    let enemyFrames;
                    enemy.battleProps = new BattleProperties();
                    enemy.battleProps.attackPower = 1;
                    enemy.battleProps.attacking = false;
                    enemy.battleProps.cooldownDuration = 0.2;
                    enemy.battleProps.cooldownRemaining = enemy.battleProps.cooldownDuration;
                    enemy.battleProps.hitStunDuration = 0.2;
                    enemy.battleProps.hitStunTimer = enemy.battleProps.hitStunDuration;
                    enemy.battleProps.invincibleDuration = 0.1;
                    enemy.battleProps.invincibleTimer = enemy.battleProps.invincibleDuration;

                    let hurtBox = enemy.battleProps.hurtBox;
                    switch (key) {
                        case "G":
                            enemy.type = EnemyType.GHOUL;
                            enemy.battleProps.hitPoints = 1;
                            enemyFrames = [
                                GameSettings.textures["ghoul_0"],
                                GameSettings.textures["ghoul_1"]
                            ];
                            hurtBox.x = -6;
                            hurtBox.y = -6;
                            hurtBox.width = 12;
                            hurtBox.height = 13;
                            break;
                        case "S":
                            enemy.type = EnemyType.SKELETON;
                            enemy.battleProps.hitPoints = 2;
                            enemyFrames = [
                                GameSettings.textures["skeleton"],
                            ];
                            hurtBox.x = -7;
                            hurtBox.y = -10;
                            hurtBox.width = 14;
                            hurtBox.height = 20;
                            break;
                        case "H":
                            enemy.type = EnemyType.GHOST;
                            enemy.battleProps.hitPoints = 3;
                            enemyFrames = [
                                GameSettings.textures["ghost_0"],
                                GameSettings.textures["ghost_1"]
                            ];
                            hurtBox.x = -7;
                            hurtBox.y = -10;
                            hurtBox.width = 14;
                            hurtBox.height = 20;
                            break;
                    }

                    let enemySprite = new PIXI.extras.AnimatedSprite(enemyFrames);
                    enemySprite.anchor.set(0.5, 0.5);
                    enemy.sprite = enemySprite;
                    enemy.sprite.play();
                    enemy.sprite.animationSpeed = 0.05;

                    let moveProps = new MovementProperties();
                    moveProps.baseSpeed = 10;
                    moveProps.position.x = j * 8;
                    moveProps.position.y = i * 8;
                    enemy.moveProps = moveProps;

                    let collisionPoints = new CollisionPoints();
                    collisionPoints.left.push(new PIXI.Point(-4, 5));
                    collisionPoints.right.push(new PIXI.Point(3, 5));
                    collisionPoints.bottom.push(new PIXI.Point(-3, 9));
                    collisionPoints.bottom.push(new PIXI.Point(2, 9));
                    enemy.collisionPoints = collisionPoints;

                    enemy.startPoint= new PIXI.Point();
                    enemy.startPoint.x = moveProps.position.x;
                    enemy.startPoint.y = moveProps.position.y;


                    if (GameSettings.showHitBoxes) {
                        let hurtSprite = new PIXI.Sprite(GameSettings.textures["hurtbox"]);
                        hurtSprite.x = enemy.moveProps.position.x + hurtBox.x;
                        hurtSprite.y = enemy.moveProps.position.y + hurtBox.y;
                        hurtSprite.width = hurtBox.width;
                        hurtSprite.height= hurtBox.height;
                        enemy.battleProps.debugHurtSprite = hurtSprite;
                        level.levelContainer.addChild(hurtSprite);
                    }
                    enemy.battleProps.invincibleTimer = enemy.battleProps.invincibleDuration;

                    let hitX;
                    let hitY;
                    let hitWidth;
                    let hitHeight;
                    switch (key) {
                        default:
                        case "G":
                            hitX = -6;
                            hitY = -4;
                            hitWidth = 12;
                            hitHeight = 12;
                            break;
                        case "S":
                            hitX = -6;
                            hitY = -4;
                            hitWidth = 12;
                            hitHeight = 12;
                            break;
                        case "H":
                            hitX = -5;
                            hitY = -6;
                            hitWidth = 10;
                            hitHeight = 12;
                            break;
                    }
                    enemy.touchAttack = level.spawnAttack(enemy, -1, 
                                                             enemy.moveProps.position.x,
                                                             enemy.moveProps.position.y,
                                                             hitX, hitY, hitWidth, hitHeight);

                    level.levelContainer.addChild(enemy.sprite);
                    level.enemies.push(enemy);
                }
                else {
                    let tile = new Tile();
                    tile.key = key;
                    tile.passable = unpassableTiles.indexOf(tile.key) == -1;
                    tile.x = j;
                    tile.y = i;
                    tile.sprite = new PIXI.Sprite(GameSettings.textures[spriteKeys[tile.key]]);
                    tile.sprite.x = tile.x * 8;
                    tile.sprite.y = tile.y * 8;
                    tileMap.container.addChild(tile.sprite);
                    tileMap.tilesByXY[j][i] = tile;
                }
            }
        }
        // TODO(ebuchholz): figure out if we can make this look nice
        tileMap.container.cacheAsBitmap = true;
        //setTimeout(function () {
        //    tileMap.container._cacheData.sprite._texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        //}.bind(this), 100);
        return level;
    }

    public addPlayerToLevel (player: Player, level: Level): void {
        level.players.push(player.character);
        if (player.character.battleProps.debugHurtSprite) {
            level.levelContainer.addChild(player.character.battleProps.debugHurtSprite);
        }
        level.levelContainer.addChild(player.character.sprite);
        player.inActionGame = true; // maybe move this somewhere else

        player.character.currentLevel = level;
        player.character.moveProps.position.x = 140; // QQQ
        if (level == this.greenLevel) {
            player.character.moveProps.position.y = 127;
        }
        else {
            player.character.moveProps.position.y = 36;
        }
        player.character.moveProps.velocity.x = 0; // QQQ
        player.character.moveProps.velocity.y = 0;
        player.character.moveProps.noClip = false;
        if (player.character.battleProps.isDead) {
            player.character.battleProps.hitPoints = 5;
            player.character.battleProps.isDead = false;
        }
        player.character.respawning = false;
        player.character.battleProps.attacking = false;
        player.character.battleProps.cooldownRemaining = player.character.battleProps.cooldownDuration;
        player.character.battleProps.hitStunTimer = player.character.battleProps.hitStunDuration;
        player.character.battleProps.invincibleTimer = player.character.battleProps.invincibleDuration;
        player.character.sprite.x = player.character.moveProps.position.x;
        player.character.sprite.y = player.character.moveProps.position.y;
        player.character.camera.x = player.character.moveProps.position.x;
        player.character.camera.y = player.character.moveProps.position.y;
        player.character.playingGolf = false;
        player.character.timeToLeaveTheLevel = false;
        player.character.animationState = "waiting";
        player.character.waitingToAppear = true;

        level.possessGolfBall(player.character);
    }

    public removePlayerFromLevel (player: Player): void {
        let level = player.character.currentLevel;
        level.players.splice(level.players.indexOf(player.character), 1);
        if (level != this.greenLevel && level.players.length == 0) {
            level.destroy();
            this.levels.splice(this.levels.indexOf(level), 1);
        }
        player.inActionGame = false;
    }

    public setCamera (player: Player,
                      screenHalfWidth: number, screenHalfHeight: number): void 
    {
        for (let i = 0; i < this.levels.length; ++i) {
            this.container.removeChild(this.levels[i].container);
        }
        let playerCharacter = player.character;
        if (playerCharacter.currentLevel) {
            playerCharacter.currentLevel.setCamera(playerCharacter, screenHalfWidth, screenHalfHeight);
        }
        this.container.addChild(playerCharacter.currentLevel.container);
    }

    public update (inputs: Input[], dt: number): void {
        // record inputs for each player ON the player, since they could exist in different 
        // levels, and might be in the wrong order in the same level
        for (let i = 0; i < this.playerCharacters.length; ++i) {
            let player = this.playerCharacters[i];
            // record inputs, will be processed in the level later
            let input = inputs[i];
            player.input = input;
        }
        for (let i = 0; i < this.levels.length; ++i) {
            this.levels[i].update(dt);
            if (this.levels[i].gameOver) { this.gameOver = true; break; }
        }
    }

    public destroy (): void {
        this.container.destroy();

    }
}
