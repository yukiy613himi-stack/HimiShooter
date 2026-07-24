class Main {
    constructor() {
        himi_js.init(850, 1500, "HimiShooter");
        this.scene = "title";
        himi_js.set_font("")
        this.screens = {
            title: new TitleScreen(this),
            play: new PlayScreen(this),
            gameover: null
        };
        himi_js.loop(this.update.bind(this), this.draw.bind(this));
    }

    update(delta) {
        this.screens[this.scene].update(delta);
    }

    draw() {
        himi_js.clear_color("rgb(35, 8, 130)")
        this.screens[this.scene].draw();
    }
}

class TitleScreen{
    constructor(screen) {
        this.screen = screen;
    }
    update(delta) {
        if (himi_js.key_down("Enter") || himi_js.pad_down("start") || himi_js.mouse_clicked) {
            this.screen.scene = "play"
        }
    }
    draw() {
        himi_js.draw_text("Himi Shooter", himi_js.width() / 2, himi_js.height() / 2, 130, "rgb(227, 147, 0)");
        himi_js.draw_text("エンターキーか画面タップまたはスタートボタンでスタート", himi_js.width() / 2, himi_js.height() / 2 + 200, 30, "rgb(227, 147, 0)");
    }
}

class PlayScreen{
    constructor(screen) {
        this.screen = screen;
        this.score = 0;
        this.spawn_timer = 0;
        this.messege = "";
        this.next_level_up_score = 1000;
        this.next_live_up_score = 5000;
        this.under_line = himi_js.height() - 350;
        this.bullet_line_left = himi_js.width() / 2 - 150;
        this.bullet_line_right = himi_js.width() / 2 + 150;
        this.player = new Player(this);
        this.player_bullet = new Player_Bullet(this);
        this.enemys = [];
        this.messege_timer = 0;
        this.enemy_bullets = [];
        this.level = 1;
    }

    spawn_enemy(delta) {
        this.spawn_timer += delta;
        if (this.spawn_timer > Math.max(0.5, 3 - this.level * 0.25)){
            if (this.level <= 2) {
                this.spawn_nomal_enemy();
            } else {
                if (himi_js.rand_int(0, 10) == 0) {
                    this.enemys.push(new mantis_shrimp(this, himi_js.rand_int(0, himi_js.width() - 80), 0));
                } else {
                    this.spawn_nomal_enemy();
                }
            }
            this.spawn_timer = 0;
        }
    }
    

    spawn_nomal_enemy() {
        if (himi_js.rand_int(0, 2) != 0){
            this.enemys.push(new Tuna(this, himi_js.rand_int(0, himi_js.width() - 80), 0));
        }else if (himi_js.rand_int(0, 1) == 0){
            this.enemys.push(new Jellyfish(this, himi_js.rand_int(0, himi_js.width() - 80), 0));
        }else{
            this.enemys.push(new Sea_urchin(this, himi_js.rand_int(0, himi_js.width() - 80), 0));
        }
    }

    enemes_update(delta) {
        for (let i = this.enemys.length - 1; i >= 0; i--) {
            this.enemys[i].update(delta)
        }
    }

    enemes_draw() {
        for (let i = this.enemys.length - 1; i >= 0; i--) {
            this.enemys[i].draw()
        }
    }

    bullet_update(delta) {
        for (let i = this.enemy_bullets.length - 1; i >= 0; i--) {
            this.enemy_bullets[i].update(delta)
        }
    }

    bullet_draw() {
        for (let i = this.enemy_bullets.length - 1; i >= 0; i--) {
            this.enemy_bullets[i].draw()
        }
    }

    draw_messege(messege){
        this.messege = messege;
        this.messege_timer = 1;
    }

    delete_messege() {
        this.messege = ""
    }
    
    update(delta) {
        if (this.score > 9999999) {
            this.score = 9999999
        }
        this.messege_timer -= delta;
        if (this.messege_timer < 0) {
            this.delete_messege()
        }
        if (this.score > this.next_level_up_score) {
            this.draw_messege("レベルアップ!!");
            this.level++;
            this.next_level_up_score += 1000;
        }
        if (this.score > this.next_live_up_score) {
            this.player.lives += 1;
            this.next_live_up_score += 5000;
        }
        this.spawn_enemy(delta);
        this.enemes_update(delta);
        this.bullet_update(delta);
        this.player.update(delta);
        this.player_bullet.update(delta);
    }
    draw() {
        this.enemes_draw();
        this.bullet_draw();
        this.player_bullet.draw();
        this.player.draw();
        himi_js.draw_rect(0, this.under_line, this.bullet_line_left, himi_js.height() - this.under_line, "rgb(0, 16, 193)")
        himi_js.draw_rect(this.bullet_line_left, this.under_line, this.bullet_line_right - this.bullet_line_left, himi_js.height() - this.under_line, "rgb(186, 0, 0)");
        himi_js.draw_rect(this.bullet_line_right, this.under_line, himi_js.width() - this.bullet_line_right, himi_js.height() - this.under_line, "rgb(0, 16, 193)")
        himi_js.draw_text(`SCORE: ${this.score}`, himi_js.width() / 2, himi_js.height() - 300, 40, "white");
        himi_js.draw_text(`PLAYER: ${this.player.lives}`, himi_js.width() / 2, himi_js.height() - 20, 30, "white");
        himi_js.draw_text(`LEVEL: ${this.level}`, himi_js.width() / 2, himi_js.height() - 50, 30, "white");
        himi_js.draw_text(`${this.messege}`, himi_js.width() / 2, himi_js.height() / 2, 100, "rgb(255, 234, 0)");
        himi_js.draw_line(0, this.under_line, himi_js.width(), this.under_line, "white", 5);
    }
}

class Game_Over{
    constructor(screen){
        this.screen = screen;
        this.timer = 0.0;
    }

    update(delta) {
        this.timer += delta;
        if (this.timer > 2.5) {
            if (himi_js.key_down("Enter") || himi_js.pad_down("start") || himi_js.mouse_clicked) {
                this.screen.screens.play = new PlayScreen(this.screen);
                this.screen.scene = "play";
            }
        }
    }
    
    draw() {
        himi_js.draw_text(
            "GAME OVER",
            himi_js.width() / 2,
            himi_js.height() / 2 - 250,
            130,
            "rgb(255, 0, 0)"
        );
        himi_js.draw_text(
            `今回の点数は${this.screen.screens.play.score}点でした`,
            himi_js.width() / 2,
            himi_js.height() / 2 - 50,
            50,
            "rgb(255, 255, 255)"
        );
        himi_js.draw_text(
            "エンターキーか画面タップまたはスタートボタンで再スタート",
            himi_js.width() / 2,
            himi_js.height() - 50,
            30,
            "rgb(255, 255, 255)"
        );
    }
}

class Player{
    constructor(screen) {
        this.screen = screen;
        this.area = himi_js.area(
            himi_js.width() / 2 - 100 / 2,
            this.screen.under_line - 70,
            100,
            70
        );
        this.lives = 2;
        this.can_shoot = true;
        this.image = himi_js.load_image("assets/player.png");
        this.speed = 300;
        this.invincible_timer = 0;
    }

    shoot() {
        if (this.can_shoot) {
            this.can_shoot = false;
            this.screen.player_bullet.area.x = this.area.x + this.area.w / 2 - this.screen.player_bullet.area.w / 2
            this.screen.player_bullet.area.y = this.area.y - this.screen.player_bullet.area.h
        }
    }

    take_damage() {
        if (this.invincible_timer > 0) return;
        this.lives -= 1;
        if (this.lives < 0) {
            this.screen.screen.screens.gameover = new Game_Over(this.screen.screen)
            this.screen.screen.scene = "gameover";
        }
        this.invincible_timer = 1.5;
    }

    update(delta) {
        //無敵タイマーを減らす
        if (this.invincible_timer > 0) {
            this.invincible_timer -= delta;
        }
        //キー
        if (himi_js.key_down("ArrowRight")){
            this.area.x += this.speed * delta;
        }
        if (himi_js.key_down("ArrowLeft")){
            this.area.x -= this.speed * delta;
        }
        if (himi_js.key_down(" ")){
            this.shoot();
        }

        //ゲームパッド
        if (himi_js.left_stick().x != 0){
            this.area.x += himi_js.left_stick().x * this.speed * delta;
        }else {
            if (himi_js.pad_down("right")){
                this.area.x += this.speed * delta;
            }
            if (himi_js.pad_down("left")){
                this.area.x -= this.speed * delta;
            }
            if (himi_js.pad_down("a") || himi_js.pad_down("b") || himi_js.pad_down("x") || himi_js.pad_down()){
                this.shoot();
            }
        }

        //タッチ
        for (const id in himi_js.touches) {
            const t = himi_js.touches[id];

            //玉発射位置がタッチされていたら動かない
            if (t.y < this.screen.under_line || t.x > this.screen.bullet_line_left && t.x < this.screen.bullet_line_right) {
                this.shoot();
                continue;
            }
            
            if (t.x > himi_js.width() / 2) {
                this.area.x += this.speed * delta;
            }else {
                this.area.x -= this.speed * delta;
            }
        }
        if (this.area.x < 0) {
            this.area.x = 0
        }
        if (this.area.x + this.area.w > himi_js.width()) {
            this.area.x = himi_js.width() - this.area.w;
        }
    }

    draw() {
        if (this.invincible_timer > 0){
            const blink = Math.floor(this.invincible_timer * 10) % 2;
            if (blink === 0) return;
        }
        himi_js.area_to_image(this.image, this.area);
    }
}

class Player_Bullet{
    constructor(screen) {
        this.screen = screen;
        this.area = himi_js.area(30, 70, 30, 70);
        this.image = himi_js.load_image("assets/bullet.png");
        this.speed = 700;
    }

    update(delta) {
        if (!this.screen.player.can_shoot) {
            this.area.y -= this.speed * delta;
        }
        if (this.area.y < 0) {
            this.screen.player.can_shoot = true;
        }
        if (this.screen.player.can_shoot) {
            this.area.x = -this.area.w
            this.area.y = -this.area.h
        }
    }

    draw() {
        if (!this.screen.player.can_shoot) {
            himi_js.area_to_image(this.image, this.area);
        }
    }
}

class Tuna{
    constructor(screen, x, y){
        this.screen = screen;
        this.point = 100;
        this.area = himi_js.area(x, y, 80, 130);
        this.image = himi_js.load_image("assets/tuna.png");
        this.explosion_timer = null;
        if (himi_js.rand_int(0, 1) == 0){
            this.move_right = false;
        }else{
            this.move_right = true;
        }
        this.shoot_timer = 1;
    }

    shoot() {
        if (himi_js.rand_int(0, 1) == 0) {
            if (this.move_right){
                this.move_right = false;
            }else{
                this.move_right = true;
            }
        }
        this.screen.enemy_bullets.push(new Enemy_Bullet(this.screen, himi_js.load_image("assets/tuna_bullet.png"), this.area.x + this.area.w / 2, this.area.y + this.area.h, 0, 300))
    }

    update(delta){
        //動かす処理
        if (this.explosion_timer == null) {
            this.area.y += 150 * delta;
            if (this.move_right){
                this.area.x += 50 * delta;
            }else{
                this.area.x -= 50 * delta;
            }
            if (this.area.x < 0) {
                this.move_right = true;
            }else if (this.area.x + this.area.w > himi_js.width()){
                this.move_right = false;
            }
        }
        //弾発射処理
        this.shoot_timer -= delta;
        if (this.shoot_timer <= 0 && this.explosion_timer == null) {
            this.shoot();
            this.shoot_timer = himi_js.rand_int(2500, 4500) / 1000
        }
        //プレイヤーの弾に当たった時の処理
        if (himi_js.collision(this.area, this.screen.player_bullet.area) && this.explosion_timer == null) {
            this.screen.score += this.point;
            this.explosion_timer = 0.3;
            this.screen.player.can_shoot = true;
            this.image = himi_js.load_image("assets/explosion.png");
        }
        //プレイヤーに当たった時の処理
        if (himi_js.collision(this.area, this.screen.player.area) && this.explosion_timer == null) {
            this.screen.player.take_damage();
            this.explosion_timer = 0.3;
            this.image = himi_js.load_image("assets/explosion.png");
        }
        //消えるまでのタイマーを減らす処理
        if (this.explosion_timer != null) {
            this.explosion_timer -= delta;
        }
        //消す処理
        if (this.explosion_timer <= 0 && this.explosion_timer != null || this.area.y + this.area.h > this.screen.under_line) {
            const index = this.screen.enemys.indexOf(this);
            if (index !== -1) {
                this.screen.enemys.splice(index, 1);
            }
        }
    }

    draw() {
        himi_js.area_to_image(this.image, this.area);
    }
}

class Sea_urchin{
    constructor(screen, x, y){
        this.screen = screen;
        this.point = 300;
        this.area = himi_js.area(x, y, 80, 80);
        this.image = himi_js.load_image("assets/sea_urchin.png");
        this.explosion_timer = null;
        if (himi_js.rand_int(0, 1) == 0){
            this.move_right = false;
        }else{
            this.move_right = true;
        }
        this.shoot_timer = 1;
    }

    shoot() {
        if (himi_js.rand_int(0, 1) == 0) {
            if (this.move_right){
                this.move_right = false;
            }else{
                this.move_right = true;
            }
        }
        this.screen.enemy_bullets.push(new Enemy_Bullet(this.screen, himi_js.load_image("assets/sea_urchin_bullet.png"), this.area.x + this.area.w / 2, this.area.y + this.area.h, -150, 300))
        this.screen.enemy_bullets.push(new Enemy_Bullet(this.screen, himi_js.load_image("assets/sea_urchin_bullet.png"), this.area.x + this.area.w / 2, this.area.y + this.area.h, 0, 300))
        this.screen.enemy_bullets.push(new Enemy_Bullet(this.screen, himi_js.load_image("assets/sea_urchin_bullet.png"), this.area.x + this.area.w / 2, this.area.y + this.area.h, 150, 300))
    }

    update(delta){
        //動かす処理
        if (this.explosion_timer == null) {
            this.area.y += 150 * delta;
            if (this.move_right){
                this.area.x += 50 * delta;
            }else{
                this.area.x -= 50 * delta;
            }
            if (this.area.x < 0) {
                this.move_right = true;
            }else if (this.area.x + this.area.w > himi_js.width()){
                this.move_right = false;
            }
        }
        //弾発射処理
        this.shoot_timer -= delta;
        if (this.shoot_timer <= 0 && this.explosion_timer == null) {
            this.shoot();
            this.shoot_timer = himi_js.rand_int(2500, 4500) / 1000
        }
        //プレイヤーの弾に当たった時の処理
        if (himi_js.collision(this.area, this.screen.player_bullet.area) && this.explosion_timer == null) {
            this.screen.score += this.point;
            this.explosion_timer = 0.3;
            this.screen.player.can_shoot = true;
            this.image = himi_js.load_image("assets/explosion.png");
        }
        //プレイヤーに当たった時の処理
        if (himi_js.collision(this.area, this.screen.player.area) && this.explosion_timer == null) {
            this.screen.player.take_damage();
            this.explosion_timer = 0.3;
            this.image = himi_js.load_image("assets/explosion.png");
        }
        //消えるまでのタイマーを減らす処理
        if (this.explosion_timer != null) {
            this.explosion_timer -= delta;
        }
        //消す処理
        if (this.explosion_timer <= 0 && this.explosion_timer != null || this.area.y + this.area.h > this.screen.under_line) {
            const index = this.screen.enemys.indexOf(this);
            if (index !== -1) {
                this.screen.enemys.splice(index, 1);
            }
        }
    }

    draw() {
        himi_js.area_to_image(this.image, this.area);
    }
}

class Jellyfish{
    constructor(screen, x, y){
        this.screen = screen;
        this.point = 300;
        this.ammo = 0;
        this.area = himi_js.area(x, y, 80, 80);
        this.image = himi_js.load_image("assets/jellyfish.png");
        this.explosion_timer = null;
        if (himi_js.rand_int(0, 1) == 0){
            this.move_right = false;
        }else{
            this.move_right = true;
        }
        this.shoot_timer = 1;
    }

    shoot() {
        if (himi_js.rand_int(0, 1) == 0) {
            if (this.move_right){
                this.move_right = false;
            }else{
                this.move_right = true;
            }
        }
        this.area.y -= 150
        this.screen.enemy_bullets.push(new Enemy_Bullet(this.screen, himi_js.load_image("assets/jellyfish_bullet.png"), this.area.x + this.area.w / 2 + 50, this.area.y + this.area.h, 0, 300))
        this.screen.enemy_bullets.push(new Enemy_Bullet(this.screen, himi_js.load_image("assets/jellyfish_bullet.png"), this.area.x + this.area.w / 2, this.area.y + this.area.h, 0, 300))
        this.screen.enemy_bullets.push(new Enemy_Bullet(this.screen, himi_js.load_image("assets/jellyfish_bullet.png"), this.area.x + this.area.w / 2 - 50, this.area.y + this.area.h, 0, 300))
    }

    update(delta){
        //動かす処理
        if (this.explosion_timer == null) {
            this.area.y += 150 * delta;
            if (this.move_right){
                this.area.x += 50 * delta;
            }else{
                this.area.x -= 50 * delta;
            }
            if (this.area.x < 0) {
                this.move_right = true;
            }else if (this.area.x + this.area.w > himi_js.width()){
                this.move_right = false;
            }
        }
        //弾発射処理
        this.shoot_timer -= delta;
        if (this.shoot_timer <= 0 && this.explosion_timer == null) {
            this.shoot();
            this.shoot_timer = himi_js.rand_int(2500, 4500) / 1000
        }
        //プレイヤーの弾に当たった時の処理
        if (himi_js.collision(this.area, this.screen.player_bullet.area) && this.explosion_timer == null) {
            this.screen.score += this.point;
            this.explosion_timer = 0.3;
            this.screen.player.can_shoot = true;
            this.image = himi_js.load_image("assets/explosion.png");
        }
        //プレイヤーに当たった時の処理
        if (himi_js.collision(this.area, this.screen.player.area) && this.explosion_timer == null) {
            this.screen.player.take_damage();
            this.explosion_timer = 0.3;
            this.image = himi_js.load_image("assets/explosion.png");
        }
        //消えるまでのタイマーを減らす処理
        if (this.explosion_timer != null) {
            this.explosion_timer -= delta;
        }
        //消す処理
        if (this.explosion_timer <= 0 && this.explosion_timer != null || this.area.y + this.area.h > this.screen.under_line) {
            const index = this.screen.enemys.indexOf(this);
            if (index !== -1) {
                this.screen.enemys.splice(index, 1);
            }
        }
    }

    draw() {
        himi_js.area_to_image(this.image, this.area);
    }
}

class mantis_shrimp{
    constructor(screen, x, y){
        this.screen = screen;
        this.point = 500;
        this.area = himi_js.area(x, y, 80, 130);
        this.image = himi_js.load_image("assets/mantis_shrimp.png");
        this.explosion_timer = null;
        if (himi_js.rand_int(0, 1) == 0){
            this.move_right = false;
        }else{
            this.move_right = true;
        }
        this.shoot_timer = 1;
    }

    shoot() {
        if (himi_js.rand_int(0, 1) == 0) {
            if (this.move_right){
                this.move_right = false;
            }else{
                this.move_right = true;
            }
        }
        this.screen.enemy_bullets.push(new Enemy_Bullet(this.screen, himi_js.load_image("assets/mantis_shrimp_bullet.png"), this.area.x + this.area.w / 2, this.area.y + this.area.h, 0, 1500))
    }

    update(delta){
        //動かす処理
        if (this.explosion_timer == null) {
            this.area.y += 150 * delta;
            if (this.move_right){
                this.area.x += 50 * delta;
            }else{
                this.area.x -= 50 * delta;
            }
            if (this.area.x < 0) {
                this.move_right = true;
            }else if (this.area.x + this.area.w > himi_js.width()){
                this.move_right = false;
            }
        }
        //弾発射処理
        this.shoot_timer -= delta;
        if (this.shoot_timer <= 0 && this.explosion_timer == null) {
            this.shoot();
            this.shoot_timer = himi_js.rand_int(2500, 4500) / 1000
        }
        //プレイヤーの弾に当たった時の処理
        if (himi_js.collision(this.area, this.screen.player_bullet.area) && this.explosion_timer == null) {
            this.screen.score += this.point;
            this.explosion_timer = 0.3;
            this.screen.player.can_shoot = true;
            this.image = himi_js.load_image("assets/explosion.png");
        }
        //プレイヤーに当たった時の処理
        if (himi_js.collision(this.area, this.screen.player.area) && this.explosion_timer == null) {
            this.screen.player.take_damage();
            this.explosion_timer = 0.3;
            this.image = himi_js.load_image("assets/explosion.png");
        }
        //消えるまでのタイマーを減らす処理
        if (this.explosion_timer != null) {
            this.explosion_timer -= delta;
        }
        //消す処理
        if (this.explosion_timer <= 0 && this.explosion_timer != null || this.area.y + this.area.h > this.screen.under_line) {
            const index = this.screen.enemys.indexOf(this);
            if (index !== -1) {
                this.screen.enemys.splice(index, 1);
            }
        }
    }

    draw() {
        himi_js.area_to_image(this.image, this.area);
    }
}

class Enemy_Bullet {
    constructor(screen, image, x, y, speed_x, speed_y){
        this.screen = screen;
        this.image = image;
        this.area = himi_js.area(x - 15, y, 30, 50);
        this.speed = {x: speed_x, y: speed_y}
    }

    update(delta) {
        //移動処理
        this.area.x += this.speed.x * delta;
        this.area.y += this.speed.y * delta;

        //プレイヤーに当たった時の処理
        if (himi_js.collision(this.area, this.screen.player.area) && this.explosion_timer == null) {
            this.screen.player.take_damage();
            const index = this.screen.enemy_bullets.indexOf(this);
            if (index !== -1) {
                this.screen.enemy_bullets.splice(index, 1);
            }
        }
        //消す処理
        if (this.explosion_timer <= 0 && this.explosion_timer != null || this.area.y + this.area.h > this.screen.under_line) {
            const index = this.screen.enemy_bullets.indexOf(this);
            if (index !== -1) {
                this.screen.enemy_bullets.splice(index, 1);
            }
        }
    }

    draw() {
        himi_js.area_to_image(this.image, this.area)
    }
}

new Main();
