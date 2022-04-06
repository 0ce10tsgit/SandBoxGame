fetch('file.txt')
.then(response => response.text())
.then(fin => {
  localStorage.setItem('world',fin);
})
var time = 0
setInterval(time++,1000)
var data = localStorage.getItem('world').split(" ")
localStorage.clear()
var ac = []
for (let p in data){
  if (data[p].includes('\n')){
    ac.push(data[p].split('\n')[0])
    ac.push('N')
    ac.push(data[p].split('\n')[1])
  }
  else{
    ac.push(data[p])
  }
}
const world = {
  center: [400,400],
  types: { //true = can  walk on false = cant
    w: true,
    b: false,
    g: true,
  },
  len: 32, //len of tile in pixels
  tiles: ac
}
var isInWater = false
var canClick = true
var places;
var breakMode = true
var bldChange = true
var item = 0
const blocks = ['b','s','d','w','g']
function update(){
  this.cursor.destroy()
  let velocity = 130
  if (isInWater){
    velocity = 50
  }
  let mouse = this.input.mousePointer
  let cursors = this.input.keyboard.createCursorKeys()
  let spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  let v = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B)
  let l = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.V)
  let acx = (mouse.x-(532-this.player.x)+32).toFixed(1)
  let acy = (mouse.y-(532-this.player.y)+32).toFixed(1)
  places = [(Math.floor(acx / 32) * 32)+16,(Math.floor(acy / 32) * 32)+16]
  this.cursor = this.physics.add.sprite(places[0],places[1], 'cursor')
  if(l.isDown){
    if(breakMode){
      this.status.setTexture('break')
    }
    else{
      this.status.setTexture('build')
    }
    this.status.setVisible(true)
    this.show.setVisible(true)
    this.show_sub.setTexture(blocks[item])
    this.show_sub.setVisible(true)
    this.status.setPosition(this.player.x+25,this.player.y+25)
    this.show.setPosition(this.player.x-25,this.player.y+25)
    this.show_sub.setPosition(this.player.x-25,this.player.y+25)
  }
  else{
    this.status.setVisible(false)
    this.show.setVisible(false)
    this.show_sub.setVisible(false)
  }
  if(v.isDown){
    if(bldChange){
      bldChange = false
      setTimeout(_ => {
        bldChange = true
      },200)
      if(item == 4){
        item = 0
      }
      else{
        item += 1
      }
    }
  }
  if (Phaser.Input.Keyboard.JustDown(spacebar)){
    if(breakMode){
      breakMode = false
    }
    else{
      breakMode = true
    }
  }
  if (cursors.left.isDown){  
    this.player.setVelocityX(-velocity);
  }else if (cursors.right.isDown){
    this.player.setVelocityX(velocity)
  }
  else{
    this.player.setVelocityX(0)
  }
  if (cursors.up.isDown){
    this.player.setVelocityY(-velocity);
  }else if(cursors.down.isDown){
    this.player.setVelocityY(velocity);
  }else{
    this.player.setVelocityY(0)
  }
  this.input.on('pointerup',_ => {
    if(canClick){
      canClick = false
      setTimeout(_ => {
        canClick = true
      })
      if (breakMode){
      for(let i in this.colliders){
        this.colliders[i].getChildren().forEach(tile => {
          if(tile.x == places[0] && tile.y == places[1]){
              tile.destroy()
            }
         })
      }
      }
      else{
        this.colliders[blocks[item]].create(places[0],places[1],[blocks[item]])
        this.player.setDepth(1)
      }
    }
      },500)
}
function create(){
  let coords = [world['center'][0],world['center'][1]]
  let num = 0
  this.colliders = {
    w: this.physics.add.group(),
    b: this.physics.add.staticGroup(),
    g: this.physics.add.group(),
    s: this.physics.add.group(),
    d: this.physics.add.group()
  }
  for(let i in world['tiles']){
    if (world['tiles'][i] == 'N'){
      coords = [coords[0]-(world['len']*num),coords[1]+world['len']]
      num = 0
      continue
    }
    this.colliders[world['tiles'][i]].create(coords[0],coords[1],world['tiles'][i])
    num++
    coords = [coords[0]+world['len'],coords[1]]
  }
  this.player = this.physics.add.sprite(532,532, 'player')
  this.cursor = this.physics.add.sprite(532,532, 'cursor')
  this.show = this.add.sprite(496,496, 'show').setScale(0.5)
  this.show_sub = this.add.sprite(507,507, blocks[item]).setScale(0.5)
  this.status = this.add.sprite(532+25,532-25, 'break').setScale(0.5)
  this.physics.add.collider(this.player, this.colliders['b']);
  this.physics.add.overlap(this.player, this.colliders['w'],_ => {
    isInWater = true
  });
  this.physics.add.overlap(this.player, this.colliders['g'],_ => {
    isInWater = false
  })
  this.physics.add.overlap(this.player, this.colliders['s'],_ => {
    isInWater = false
  })
  this.physics.add.overlap(this.player, this.colliders['d'],_ => {
    isInWater = false
  })
  this.cameras.main.startFollow(this.player)
  this.cameras.main.zoom = 1;
}
function preload(){
  this.load.image('player', 'assets/sprite.png')
  this.load.image('g','assets/grass.png')
  this.load.image('w','assets/water.png')
  this.load.image('b','assets/block.png')
  this.load.image('cursor','assets/cursor.png')
  this.load.image('s','assets/s.png')
  this.load.image('d','assets/d.png')
  this.load.image('show','assets/curr_block.png')
  this.load.image('break','assets/break.png')
  this.load.image('build','assets/build.png')
}
const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 1000,
    backgroundColor: '#353935',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 0
            },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
//why is replit dying
const game = new Phaser.Game(config);