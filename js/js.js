
const CARDS = [
	{
		id:"bastos3",
		path:"img/3debastos.png"
	},
	{
		id:"espadas3",
		path:"img/3deespadas.png"
	},
	{
		id:"oros4",
		path:"img/4deoros.jpg"
	},
	{
		id:"copas8",
		path:"img/8decopas.png"
	}
]	
const REVERSE_PATH="img/back.png";
const GOLD_ACE_PATH="img/Asdeoros.png";
const GOLD_ACE_ID="goldace";


const PROPORTIONAL_FACTOR=0.6518;
const CARD_HEIGHT=200;
const CARD_WIDTH=CARD_HEIGHT*PROPORTIONAL_FACTOR;

function Card(config){
	this.id=config.id||"unknown";
	this.path=config.path;
	this.flop;
	this.element;
	this.img;
	this.width;
	this.animationInterval;
	this.boundEvent=this.flip.bind(this);
	this.initialize();
}



Card.prototype.initialize=function(){
	this.flop=false;

	this.element = document.createElement("div");
	this.element.classList.add("card");
	this.img = document.createElement("img");
	this.element.style.width = CARD_WIDTH + "px";
	this.element.style.height = CARD_HEIGHT + "px";
	this.img.style.width = CARD_WIDTH + "px";
	this.img.style.height = CARD_HEIGHT + "px";
	this.element.appendChild(this.img);
	this.width=CARD_WIDTH;
	this.animationInterval=0;
	this.img.id=this.id;
	this.update();
}

Card.prototype.getCard=function(){
	return this.element;
}

Card.prototype.preAnimationCycle=function(){
	const REDUCTION=9;
	const LIMIT=0;
	if(this.width>REDUCTION){
		this.width = this.width-REDUCTION;
	}else{
		this.width = LIMIT;
		clearInterval(this.animationInterval);
		this.animationInterval=0;
		this.flipChange();
	}
	this.img.style.width=this.width + "px";

}
Card.prototype.postAnimationCycle=function(){
	const INCREMENT=9;
	const LIMIT=CARD_WIDTH;
	if(this.width<(LIMIT-INCREMENT)){
		this.width = this.width+INCREMENT;
	}else{
		this.width = LIMIT;
		clearInterval(this.animationInterval);
		this.animationInterval=0;

	}
	this.img.style.width=this.width + "px";
}

Card.prototype.doPreFlipAnimation=function(){
	if(this.animationInterval==0){
		this.animationInterval=setInterval(this.preAnimationCycle.bind(this),20);
	}
}

Card.prototype.doPostFlipAnimation=function(){
	if(this.animationInterval==0){
		this.animationInterval=setInterval(this.postAnimationCycle.bind(this),20);
	}
}

Card.prototype.update=function(){
	if(this.flop){
		this.img.setAttribute("src",this.path);
	}
	if(!this.flop){
		this.img.setAttribute("src",REVERSE_PATH);
	}
}

Card.prototype.flipChange=function(){
	this.flop=!this.flop;
	this.update();
	this.doPostFlipAnimation();
}

Card.prototype.flip=function(){
	if(this.animationInterval==0){
		this.doPreFlipAnimation();
		return true;
	}

	if(this.animationInterval!=0)
		return false;
}

Card.prototype.turnDown=function(){
	if(this.flop)
		this.flip();
}




const TURN_DOWN_DELAY_MS=800;
const FAIL_FLIP_DELAY_MS=500;
function Game(){
	this.element;
	this.counter;
	this.cards=[];
	this.initialize();
	this.turnDownThread;
	this.boundFlipEvent=this.flipEvent.bind(this);
	this.resultMessage;
	this.resetButton;
}


Game.prototype.createRandomCard=function(){
	var randomCardConfig=0
	do{
		randomCardConfig=CARDS[Math.floor(Math.random()*CARDS.length)];
	}while(this.getCard(randomCardConfig.id));
	return new Card(randomCardConfig);
}

Game.prototype.createResetButton=function(){
	const BUTTON_TEXT="Otra vez";
	var button=document.createElement("button");
	button.innerHTML=BUTTON_TEXT;
	button.addEventListener("click",this.reset.bind(this),true);
	return button;
}
Game.prototype.createHeader=function(){
	const TITLE="TRILERO";
	var h2 = document.createElement("h2");
	h2.innerHTML=TITLE;
	var header = document.createElement("div");
	header.classList.add("trilero-header");
	header.appendChild(h2);
	return header;
}
Game.prototype.createFooter=function(){

	this.resetButton = this.createResetButton();
	this.resultMessage=document.createElement("h3");
	this.updateResultMessage();
	var footer=document.createElement("div");
	footer.classList.add("trilero-footer");
	footer.appendChild(this.resultMessage);
	footer.appendChild(this.resetButton);
	return footer
}

Game.prototype.createGoldAceCard=function(){
	var config = {};
	config.id=GOLD_ACE_ID;
	config.path=GOLD_ACE_PATH;
	return new Card(config);
}

Game.prototype.initialize=function(){
	//Attributes
	this.counter=0;
	this.turnDownThread=0;

	//DOM Elements
	this.element=document.createElement("div");
	this.element.classList.add("tablero");
	this.cards.push(this.createRandomCard());
	this.cards.push(this.createRandomCard());
	this.cards.push(this.createGoldAceCard());
	this.cards.forEach(function(card){
			var cardElement=card.getCard();
			this.element.appendChild(cardElement);
		}.bind(this));
	var header=this.createHeader();
	var footer=this.createFooter();

	//append
	var container = document.getElementById("trilero");
	container.appendChild(header);
	container.appendChild(this.element);
	container.appendChild(footer);

	//Methods
	this.reset();
}


Game.prototype.start=function(){
	this.shuffle();
	this.addFlipEvent();
	if(this.turnDownThread!=0)
		this.turnDownThread=0;
}

Game.prototype.shuffle=function(){
	this.cards.forEach(function(card){
			var randomInt = parseInt(Math.random()*100);
			card.getCard().style.order=randomInt.toString();
		});
}

Game.prototype.getCard=function(id){
	return this.cards.find(element => id==element.id)
}

Game.prototype.flipAce=function(event){
	var card=this.getCard(GOLD_ACE_ID);
	card.flip();
	this.updateResultMessage("¡Vaya, realmente estaba aquí!");
	setTimeout(this.buttonEnable.bind(this),TURN_DOWN_DELAY_MS);
}

Game.prototype.flipEvent=function(event){
	var target=event.target;

	if(target && target.matches("img")){
		this.removeFlipEvent();
		var card=this.getCard(target.id);
		card.flip();
		if(card.id==GOLD_ACE_ID){
			this.counter++;
			this.updateResultMessage("¡Has ganado!");
			setTimeout(this.buttonEnable.bind(this),TURN_DOWN_DELAY_MS);
		}
		
		if(card.id!=GOLD_ACE_ID){
			setTimeout(this.flipAce.bind(this),FAIL_FLIP_DELAY_MS);
		}
	}
}

Game.prototype.buttonEnable=function(){
	this.resetButton.removeAttribute("disabled");
}
Game.prototype.buttonDisable=function(){
	this.resetButton.setAttribute("disabled","disabled");
}

Game.prototype.addFlipEvent=function(){
	this.element.addEventListener("click", this.boundFlipEvent, true);
}

Game.prototype.removeFlipEvent=function(){
	this.element.removeEventListener("click", this.boundFlipEvent, true);
}

Game.prototype.updateResultMessage=function(message){
	if(message){
		this.resultMessage.innerHTML=message + "(Has ganado " + this.counter + " veces)";
	}
	if(!message)
		this.resultMessage.innerHTML="Has ganado " + this.counter + " veces";
	
}

Game.prototype.reset=function(){
	if(this.turnDownThread==0){
		this.buttonDisable();
		this.cards.forEach(function(card){
				card.turnDown();
			});
		this.turnDownThread=setTimeout(this.start.bind(this),TURN_DOWN_DELAY_MS);
		this.updateResultMessage();
	}
}


var game = new Game();
