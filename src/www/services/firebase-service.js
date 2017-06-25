const firebase = require("firebase"),
    config = {
      databaseURL: 'https://hacker-news.firebaseio.com'
    },
    versionPath = "/v0";
    

firebase.initializeApp(config);

const db = firebase.database(),
    api = db.ref(versionPath),
    cache = {};


function itemRef(id) {
  return api.child(`/item/${id}`);
}

function storyRef(story) {
  return api.child(`/${story}stories`);
}

function fetchStoryIds(story) {
  return new Promise((res, rej)=> {
    storyRef(story).limitToFirst(300).once("value", snapshot => {
      // console.log("value event", snapshot.val());
      const ids = snapshot.val();
      // console.log(storyIds);
      cache[story] = {
        ids: ids,
      }
      res(ids);
    });
  });
}

function storyData(story, start, limit) {
  const storyIds = cache[story].ids.slice(start, start + limit), 
      ref = storyRef(story), 
      stories = [];
  return new Promise((res, rej) => {
    storyIds.forEach(id => {
      itemRef(id).once("value", storyItem => {
        // console.log("child", storyItem);
        const story = storyItem.val();
        story.key = storyItem.key;
        stories.push(story);
        if(stories.length >= storyIds.length) {
          res(stories);
        }
      });
    });
  });
}

function stories(type = "top", start = 0, count = 50) {
  const storyIds = cache[type];
  // console.log("cached " + type, storyIds);
  if(!storyIds) {
    return fetchStoryIds(type).then(() => {
      return storyData(type, start, count);
    });
  }else {
    return storyData(type, start, count);
  }
}


function Pagination(fetch, limit) {
  this.fetch = fetch;
  this.limit = limit;
  this.offset = 0;
  this.end = false;
}
Pagination.prototype = {
  constructor: Pagination,

  next() {
    if(this.end) {
      return Promise.resolve();
    }
    return this.fetch(this.offset, this.limit).then(data => {
      const {length} = data;
      if(length < this.limit) {
        this.end = true;
      }
      this.offset += length;
      this.data = data;
      return data; 
    });
  },

  hasNext() {
    return !this.end;
  },

  previous() {
    this.offset -= (this.limit * 2);
    if(this.offset < 0) {
      this.offset = 0;
      return Promise.resolve();
    }
    
    return this.fetch(this.offset, this.limit).then(data => {
      this.offset -= this.limit;
      this.end = false;
      this.data = data;
      return data;
    });
  },

  hasPrevious() {
    return this.offset - this.limit > 0;
  }
};


function paginator(type, count) {
  return new Pagination((offset, limit) => {
    return stories(type, offset, limit);
  }, count)
}


module.exports = {
  stories,
  topStories(count) {
    return paginator("top", count);
  },
  newStories(count) {
    return paginator("new", count);
  },
  showStories(count) {
    return paginator("show", count);
  },
  askStories(count) {
    return paginator("ask", count);
  },
  jobStories(count) {
    return paginator("job", count);
  }
};
