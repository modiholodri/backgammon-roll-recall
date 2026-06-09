if (typeof Dexie === 'undefined') {
  throw new Error('Dexie is required and should be loaded before this script');
}

const DB_NAME = 'RollRecallDB';
const DB_VERSION = 1;
const TABLE_NAME = 'blunders';

class BlunderStore extends Dexie {
  constructor() {
    super(DB_NAME);
    this.version(DB_VERSION).stores({
      blunders: '++id'
    });
    this.blunders = this.table(TABLE_NAME);
  }

  async init() {
    try {
      await this.open();
      return true;
    } catch (error) {
      console.error('BlunderStore init failed', error);
      return false;
    }
  }

  async addBlunder(blunder) {
    if (!blunder || typeof blunder !== 'object') {
      throw new Error('Invalid blunder object');
    }
    return this.blunders.add(blunder);
  }

  async getBlunder(id) {
    return this.blunders.get(id);
  }

  async getAllBlunders() {
    return this.blunders.toArray();
  }

  async updateBlunder(id, changes) {
    return this.blunders.update(id, changes);
  }

  async deleteBlunder(id) {
    return this.blunders.delete(id);
  }

  async clearBlunders() {
    return this.blunders.clear();
  }

//   async findBlundersByGame(gameId) {
//     return this.blunders.where('gameId').equals(gameId).toArray();
//   }

  async importBlunders(blunderArray) {
    if (!Array.isArray(blunderArray)) {
      throw new Error('importBlunders expects an array');
    }
    return this.transaction('rw', this.blunders, async () => {
      return Promise.all(blunderArray.map((blunder) => this.blunders.add(blunder)));
    });
  }

  createBlunderObject({
    positionId,
    matchId,
    alert,
    moves = [],
  } = {}) {
    return {
      positionId,
      matchId,
      alert,
      moves,
    };
  }
}

const blunderStore = new BlunderStore();

blunderStore.init().then(() => {
  console.log('BlunderStore initialized successfully');

  const move1 = new Move(1, '13/7*', '47.9 13.4 0.6', '52.1 14.5 0.9', '-0.042', '');
  const move2 = new Move(2, '8/7* 6/1*', '47.9 13.4 0.6', '52.4 15.7 1.1', '-0.048', '(-0.006)');
  
  const sampleBlunder = blunderStore.createBlunderObject({
    positionId: '4HPhASjgc/ABMA',
    matchId: 'cImpAAAAAAAE',
    alert: 'Alert: doubtful move ( -0.057)',
    moves: [move1, move2],
  });
  
  blunderStore.addBlunder(sampleBlunder).then((id) => {
    console.log('Sample blunder added with ID:', id);
  }).catch((error) => {
    console.error('Failed to add sample blunder', error);
  });
}).catch((error) => {
  console.error('Failed to initialize BlunderStore', error);
});



