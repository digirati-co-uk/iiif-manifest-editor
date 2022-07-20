<template>
  <div>This is from {{name}} (time: {{time}})</div>
  <button @click="ctx.actions.toggle('example-left-panel')">Toggle</button>
  <button @click="ctx.actions.open('react')">Next panel</button>

  <button @click="ctx.actions.open('example-left-panel', {time: Date.now()})">Open (state)</button>
</template>

<script type="module">
  export default {
    props: ['time', 'ctx'],
    data() {
      return {
        name: 'VueJS',
      }
    },
    watch: {
      ctx: {
        handler() {
          console.log(this.ctx);
        }
      }
    },
    computed: {
      time() {
        return this.time;
      }
    }
  }
</script>
