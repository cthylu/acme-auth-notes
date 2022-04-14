const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
const conn = require('./conn');
const { Note } = require('./Note');
const { STRING } = Sequelize;

const User = conn.define('user', {
  username: STRING,
  password: STRING
});

User.addHook('beforeSave', async(user)=> {
  if(user.changed('password')){
    const hashed = await bcrypt.hash(user.password, 3);
    user.password = hashed;
  }
});

User.byToken = async(token)=> {
  try {
    const payload = await jwt.verify(token, process.env.JWT);
    const user = await User.findByPk(payload.id, {
      attributes: {
        exclude: ['password']
      }
    });
    if(user){
      return user;
    }
    const error = Error('bad credentials');
    error.status = 401;
    throw error;
  }
  catch(ex){
    const error = Error('bad credentials');
    error.status = 401;
    throw error;
  }
};

User.authenticate = async({ username, password })=> {
  const user = await User.findOne({
    where: {
      username
    }
  });
  if(user && await bcrypt.compare(password, user.password) ){
    return jwt.sign({ id: user.id}, process.env.JWT); 
  }
  const error = Error('bad credentials!!!!!!');
  error.status = 401;
  throw error;
};

Note.belongsTo(User);
User.hasMany(Note);

const syncAndSeed = async()=> {
  await conn.sync({ force: true });
  const credentials = [
    { username: 'lucy', password: 'lucy_pw'},
    { username: 'moe', password: 'moe_pw'},
    { username: 'larry', password: 'larry_pw'}
  ];
  const [lucy, moe, larry] = await Promise.all(
    credentials.map( credential => User.create(credential))
  );

  const notes = [
    { 
      title: 'Whats the best way to train after the first Gym in Pokemon Silver?', 
      content: 'Ok so this is my first introduction to the sprite based games and its certainly different without an exp share. I would like to know what the best way to train my mons to atleast lvl 20 before the second gym.',
      userId: larry.id
    },
    {
      title: 'Best Poké Ball',
      content: 'I think it might be Luxury Ball. Although the catch rate isn’t the best and it’s very expensive, the ability to raise friendship quickly is important to me. Say you transfer your Pokémon up Galar from Kanto, your TID would be different and the friendship values would reset. A Luxury Ball allows for friendship to increase quickly and I think that’s nice. I see a lot of people like Premier Balls, but I think they’re over glorified Poké Balls lol, they pretty tho. In terms of looks tho, Beast Balls look the coolest imo.',
      userId: moe.id
    },
    {
      title: 'Idea for new regional variant (Nidoran)',
      content: 'For this regional variant, the males and females look much closer to each other. They share a dex number and evolutionary lines. Type would be Dark. Nidoran > Nidorin > Nidojack. If Nidorin is holding an Amulet Coin (or whatever item increases your money after battles) when given a Moon Stone, it evolves into Nidoace.',
      userId: moe.id
    },
    {
      title: 'Best non-Legendary, non-Mega Evolution, non-Gigantamax, Psychic-type Pokémon for casual play',
      content: 'I really want a good Psychic-type Pokémon in my team. But I’m unable to get Legendary Pokémon, and already have a pokémon as my main Mega pokémon. Currently I’m running with Gothitelle, but I’m wondering if there are any pokémon that are better? I rarely use proper strategy when playing and prefer to just use offensive moves that are effective, though I do use some utility moves like buffs (Calm Mind, Swords Dance, Dragon Dance) or protection (Substitute, Light Screen, Protect).',
      userId: lucy.id
    }
  ]
  const newNotes = await Promise.all(
    notes.map( note => Note.create(note))
  );

  return {
    users: {
      lucy,
      moe,
      larry
    }
  };
};

module.exports = {
  syncAndSeed,
  models: {
    User
  }
};
