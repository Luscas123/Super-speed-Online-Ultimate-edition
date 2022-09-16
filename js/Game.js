class Game {
  constructor() {
    this.resetTitle = createElement("h2");
    this.resetButton = createButton("");

    this.leadeboardTitle = createElement("h2");

    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");

    this.keyActive = false;
    
    this.keyAux = false;

    this.blast = false;


  }

  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function(data) {
      gameState = data.val();
    });
  }
  update(state) {
    database.ref("/").update({
      gameState: state
    });
  }

  start() {
    player = new Player();
    playerCount = player.getCount();

    form = new Form();
    form.display();

    car1 = createSprite(width / 2 - 50, height - 100);
    car1.addImage("car1", car1_img);
    car1.scale = 0.07;
    car1.addImage("blast", blastImage);

    car2 = createSprite(width / 2 + 100, height - 100);
    car2.addImage("car2", car2_img);
    car2.scale = 0.07;
    car2.addImage("blast", blastImage);

    cars = [car1, car2];

    var obstaclesPositions = [
      { x: width / 2 + 250, y: height - 800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 1300, image: obstacle1Image },
      { x: width / 2 + 250, y: height - 1800, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 2300, image: obstacle2Image },
      { x: width / 2, y: height - 2800, image: obstacle2Image },
      { x: width / 2 - 180, y: height - 3300, image: obstacle1Image },
      { x: width / 2 + 180, y: height - 3300, image: obstacle2Image },
      { x: width / 2 + 250, y: height - 3800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 4300, image: obstacle1Image },
      { x: width / 2 + 250, y: height - 4800, image: obstacle2Image },
      { x: width / 2, y: height - 5300, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 5500, image: obstacle2Image }
    ];

    obstacles = new Group();

    fuels = new Group()
    
    powerCoins = new Group()

    this.addSprites(4, fuelImage, 0.02, fuels);

    this.addSprites(10, powerCoinImage, 0.09, powerCoins);

    this.addSprites(obstaclesPositions.length, obstacle1Image, 0.04, obstacles, obstaclesPositions);


  }

  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");

    //C39
    this.resetTitle.html("Reset Game");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width / 2 + 200, 40);

    this.resetButton.class("resetButton");
    this.resetButton.position(width / 2 + 230, 100);

    this.leadeboardTitle.html("Leaderboard");
    this.leadeboardTitle.class("resetText");
    this.leadeboardTitle.position(width / 3 - 60, 40);

    this.leader1.class("leadersText");
    this.leader1.position(width / 3 - 50, 80);

    this.leader2.class("leadersText");
    this.leader2.position(width / 3 - 50, 130);
  }

  play() {
    this.handleElements();
    this.handleResetButton();

    player.getCarsAtEnd();

    Player.getPlayersInfo();

    if (allPlayers !== undefined) {
      image(track, 0, -height * 5, width, height * 6);

     
      this.showLeaderboard();

      this.showLife();
      this.showFuel();

       //índice da matriz
      var index = 0;
      for (var plr in allPlayers) {
        //adicione 1 ao índice para cada loop
        index = index + 1;

        //use os dados do banco de dados para exibir os carros nas direções x e y
        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY;



        cars[index - 1].position.x = x;
        cars[index - 1].position.y = y;

        var vida = allPlayers [plr].life

        if ( vida <= 0){
          cars [index-1].changeImage("blast");
          cars [index -1].scale = 0.3;

          this.blast = true
        }



        if (index === player.index) {
          stroke(10);
          fill("red");
          ellipse(x, y, 60, 60);

          this.addCoin(index);
          this.addFuel(index);

          this.collision(index);
          this.carsCollision(index);

          //alterar a posição da câmera na direção y
          camera.position.y = cars[index - 1].position.y;
        }
      }

      //manipulando eventos de teclado
      this.handlePlayerControls();

      if (this.keyActive){
        player.positionY+=5

        player.update()
      } 

  

      const chegada = height*6 - 100;

      if (player.positionY> chegada){
        gameState= 2
        player.rank += 1

        Player.updateCarsEnd(player.rank);

        player.update();

        this.showRank();
      }


      drawSprites();
    }
  }

  handleResetButton() {
    this.resetButton.mousePressed(() => {
      database.ref("/").set({
        playerCount: 0,
        gameState: 0,
        players: {},
        carsAtEnd: 0
      });
      window.location.reload();
    });
  }
  

  showLeaderboard() {
    var leader1, leader2;
    var players = Object.values(allPlayers);
    if (
      (players[0].rank === 0 && players[1].rank === 0) ||
      players[0].rank === 1
    ) {
      // &emsp;    Essa etiqueta é usada para exibir quatro espaços.
      leader1 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;

      leader2 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;
    }

    if (players[1].rank === 1) {
      leader1 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;

      leader2 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;
    }

    this.leader1.html(leader1);
    this.leader2.html(leader2);
  }

  handlePlayerControls() {
    if(!this.blast){
      if (keyIsDown(UP_ARROW)) {
        this.keyActive = true;
        player.positionY += 8;
        player.fuel -=0.3
        player.update();
      }

      if (keyIsDown(LEFT_ARROW) && player.positionX > width / 3 - 50) {
        this.keyAux = true
        player.positionX -= 5;
        player.update();
      }

      if (keyIsDown(RIGHT_ARROW) && player.positionX < width / 2 + 300) {
        this.keyAux = false
        player.positionX += 5;
        player.update();
      }
    
    }
      
  }

  addSprites(number,img,scale,group, position = []){
    
    for (var i= 0; i<number; i++){
      var x
      var y
    
      if (position.length>0){
        x = position[i].x;
        y = position[i].y;

        img = position[i].image;
      } else {
        x = random (width/2 + 150, width/2 - 150);
        y = random (-height*4.5, height - 400);
      }

      var sprites = createSprite(x,y);
      sprites.addImage(img);
      sprites.scale = scale;
      group.add(sprites);

      
      
    }
  }

  addCoin(index){
    cars[index-1].overlap(powerCoins, function (coletor, coletavel){
      player.score += 5;

      coletavel.remove();

      player.update();
    })
    
  }

  addFuel(index){
    cars[index-1].overlap(fuels, function (coletor, coletavel){
      player.fuel = 200;
      

      coletavel.remove();

      

      player.update();
    })
    if (player.fuel>0 && this.keyActive){
    player.fuel -= 0.5
    } 

    if (player.fuel<= 0){
      this.gameOver();
      gameState = 2

    }
    
  }

  showRank() {
    swal({
      title: `Incrível!${"\n"}Rank${"\n"}${player.rank}`,
      text: "Parabéns você voou na pista muleque!",
      imageUrl:
        "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
      imageSize: "100x100",
      confirmButtonText: "Ok"
    });
  }

  gameOver() {
    swal({
      title: `Fim de Jogo`,
      text: "Treine mais, você perdeu a corrida!",
      imageUrl:
        "https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png",
      imageSize: "100x100",
      confirmButtonText: "Obrigado por jogar"
    });
  }

  showLife() {
    image(lifeImage, width/2 -130, height- player.positionY- 250, 20,20);
    fill("red")
    rect(width/2 - 100, height - player.positionY - 250, 200, 20)
    fill("green")
    rect(width/2 - 100, height - player.positionY - 250, player.life, 20)
  }

  showFuel() {
    image(fuelImage, width/2 -130, height- player.positionY- 300, 20,20);
    fill("black")
    rect(width/2 - 100, height - player.positionY - 300, 200, 20)
    fill("yellow")
    rect(width/2 - 100, height - player.positionY - 300, player.fuel, 20)
  }

  collision (index) {
    if (cars [index -1].collide(obstacles)){
      if(this.keyAux){
        player.positionX += 100
      } else {
        player.positionX -= 100
      }
      
      if(player.life>0){
        player.life -= 50
        
      }
    player.update();
    }
  }

  carsCollision (index){
    if (index===1){
      if (cars [index-1].collide(cars[1])){
        if(this.keyAux){
          player.positionX += 100
        } else {
          player.positionX -= 100
        }
        
        if(player.life>0){
          player.life -= 50
          
        }
      player.update();
      }
    }

    if (index===2){
      if (cars [index-1].collide(cars[0])){
        if(this.keyAux){
          player.positionX += 100
        } else {
          player.positionX -= 100
        }
        
        if(player.life>0){
          player.life -= 50
          
        }
      player.update();
      }
    }
  }
  
}
