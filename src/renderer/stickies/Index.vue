<template>
  <div
    class="dragable"
    :style="{ background: data?.value.color, height: '100%' }"
  >
    <input
      class="non-border"
      type="text"
      :value="data?.value.title"
      @input="(e) => (data.value.title = e.target.value)"
    />
    <br />
    <br />
    <textarea
      style="width: 100%; height: 100%;"
      class="non-border"
      name=""
      id=""
      cols="30"
      rows="10"
      :value="data?.value.content"
      @input="(e) => (data.value.content = e.target.value)"
    ></textarea>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { useUserData } from "../composition";

export default defineComponent({
  setup() {
    let data = ref<any>(null);
    onMounted(() => {
      const query = location.href.split("?id=")[1];
      if (query) {
        data.value = useUserData("sticky" + query, {
          title: "",
          content: "",
        });
      }
    });
    return {
      data: data,
    };
  },
});
</script>
<style lang="less" scoped>
.non-border {
  border: 0;
  resize: none;
  background: transparent;
  &:focus {
    outline: none;
  }
}
</style>