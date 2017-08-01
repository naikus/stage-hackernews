const timeago = require("timeago.js")();

module.exports = {
  story: {
    props: ["story"],
    template: `
    <div class="story">
      <span class="score">{{story.score}}</span>
      <a class="title" target="_blank" :href="story.url">{{story.title}}</a>
      <div class="detail">
        <a href="#">{{story.by}}</a> 
        <span>{{story.time | timeago}}</span>
        <span v-if="story.descendants"> | {{story.descendants}} comments</span>
      </div>
    </div>`,
    filters: {
      timeago: time => timeago.format(new Date(time * 1000))
    },
  },

  comment: {
    name: "hn-comment",
    props: ["comment"],
    template: `
    <div class="comment">
      <div class="detail">
        <a href="#">{{comment.by}}</a> 
        <span>{{comment.time | timeago}}</span>
        <span v-if="comment.kids"> | {{comment.kids.length | replies}}</span>
      </div>
      <div class="text" v-html="comment.text"></div>
      <div class="replies" v-if="comment.kids.length">
        <hn-comment v-for="reply in comment.replies" v-bind:key="reply.id" 
            v-bind:comment="reply"></hn-comment>
      </div>
    </div>`,
    filters: {
      timeago: time => timeago.format(new Date(time * 1000)),
      replies: len => len + (len === 1 ? " reply" : " replies")
    },
  }
}