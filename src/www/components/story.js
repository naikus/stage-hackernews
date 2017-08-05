const timeago = require("timeago.js")();

module.exports = {
  story: {
    name: "story-card",
    props: ["story", "onAction"],
    template: `
    <div class="story">
      <span class="score">{{story.score}}</span>
      <a class="title" target="_blank" :href="story.url">{{story.title}}</a>
      <div class="detail">
        <a class="by" v-on:click.stop="handleUserClick">{{story.by}}</a> 
        <span>{{story.time | timeago}}</span>
        <span v-if="story.descendants"> |
          <span class="story-comments">{{story.descendants | comments}}</span>
        </span>
      </div>
    </div>`,
    methods: {
      handleUserClick() {
        this.$emit("action", "user", this.story.by);
      }
    },
    filters: {
      timeago: time => timeago.format(new Date(time * 1000)),
      comments: len => len + (len === 1 ? " comment" : " comments")
    },
  },

  comment: {
    name: "hn-comment",
    props: ["comment", "onaction"],
    template: `
    <div class="comment">
      <div class="detail activable" v-on:click.stop="onaction('comment', comment)">
        <a href="#">{{comment.by}}</a> 
        <span>{{comment.time | timeago}}</span>
        <span v-if="comment.kids"> | {{comment.kids.length | replies}}</span>
      </div>
      <div class="text" v-html="comment.text"></div>
      <div class="replies" v-if="comment.replies.length">
        <hn-comment v-for="reply in comment.replies" v-bind:key="reply.id" 
            v-bind:onaction="this.onaction"
            v-bind:comment="reply">
        </hn-comment>
      </div>
    </div>`,
    filters: {
      timeago: time => timeago.format(new Date(time * 1000)),
      replies: len => len + (len === 1 ? " reply" : " replies")
    },
  }
}