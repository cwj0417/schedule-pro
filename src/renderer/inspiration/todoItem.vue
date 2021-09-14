<template>
  <div
    class="
      w-full
      h-10
      flex
      leading-10
      text-gray-600 text-sm
      rounded-md
      hover:bg-blue-50
      relative
      group
    "
    :class="{
      'bg-gray-100': singleLine,
    }"
  >
    <div
      class="w-full flex mr-3 overflow-x-hidden"
      :class="{
        'line-through': inspiration.done,
        'text-gray-400': inspiration.done,
      }"
    >
      <template v-if="isEditing">
        <input
          ref="inputRef"
          class="flex-grow outline-none bg-transparent px-5"
          type="text"
          :value="editingContent"
          @input="(e) => (editingContent = e.target.value)"
          @keypress.enter="
            $emit('changeItem', editingContent);
            isEditing = false;
          "
          @keydown.esc="isEditing = false"
        />
        <span
          class="mx-1 my-2 h-6 leading-6 px-2 border text-gray-500 border-gray-300 rounded-md animate-pulse"
          @click="isEditing = false"
        >
          esc
        </span>
        <span
          class="mx-1 my-2 h-6 leading-6 px-2 border text-gray-500 border-gray-300 rounded-md animate-pulse"
          @click="
            $emit('changeItem', editingContent);
            isEditing = false;
          "
          >enter</span
        >
      </template>
      <template v-else>
        <div
          :class="{
            'bg-blue-500': !inspiration.done,
            'bg-white': inspiration.done,
          }"
          @click="$emit('toggleItem')"
          class="w-2 h-2 rounded-md m-4 border cursor-pointer border-blue-500"
        ></div>
        <div
          class="
            w-8
            cursor-pointer
            text-center
            opacity-0
            transform
            -translate-x-16
            transition-all
            group-hover:opacity-100 group-hover:translate-x-0
          "
          @click="
            isEditing = true;
            editingContent = inspiration.content;
            inputfocus();
          "
        >
          <svg
            class="m-auto inline-block"
            width="13px"
            height="13px"
            viewBox="0 0 13 13"
            version="1.1"
          >
            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
              <g transform="translate(-97.000000, -194.000000)">
                <g transform="translate(96.000000, 192.000000)">
                  <g>
                    <path
                      d="M13.1359779,7.37047653 C13.1359779,7.13900573 13.3288195,6.95127195 13.5665881,6.95127195 C13.8043567,6.95127195 13.9971983,7.13900573 13.9971983,7.37047653 L13.9971983,12.7983375 C13.9971983,14.012354 12.9826807,15 11.7356336,15 L3.261512,15 C2.01453664,15 0.999947253,14.012354 0.999947253,12.7983375 L0.999947253,4.20166249 C0.999947253,2.98771587 2.01453664,2 3.261512,2 L8.93394009,2 C9.17178046,2 9.36455029,2.18766392 9.36455029,2.41920459 C9.36455029,2.65074525 9.17178046,2.83840917 8.93394009,2.83840917 L3.261512,2.83840917 C2.48935615,2.83840917 1.86116764,3.4499588 1.86116764,4.20166249 L1.86116764,12.7983375 C1.86116764,13.5500412 2.48935615,14.1615908 3.261512,14.1615908 L11.7356336,14.1615908 C12.5077894,14.1615908 13.1359779,13.5500412 13.1359779,12.7983375 L13.1359779,7.37047653 Z M7.71012008,9.16182583 C7.54904694,8.99928743 7.54904694,8.73574351 7.71012008,8.57320511 L13.2957764,2.93673683 C13.4567808,2.77419843 13.7180864,2.77419843 13.8790908,2.93673683 C14.0402327,3.09927523 14.0402327,3.36281915 13.8790908,3.52535755 L8.29343447,9.16182583 C8.21293227,9.24312972 8.10733759,9.28378166 8.00181165,9.28378166 C7.89628571,9.28378166 7.79062228,9.24312972 7.71012008,9.16182583 Z"
                      fill="#999999"
                    ></path>
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </div>
        <div
          class="
            w-8
            cursor-pointer
            text-center
            opacity-0
            transform
            -translate-x-16
            transition-all
            group-hover:opacity-100 group-hover:translate-x-0
          "
          @click="$emit('deleteItem', inspiration.id)"
        >
          <svg
            class="m-auto inline-block"
            width="16px"
            height="16px"
            viewBox="0 0 16 16"
            version="1.1"
          >
            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
              <g transform="translate(-70.000000, -192.000000)">
                <g transform="translate(70.000000, 192.000000)">
                  <g>
                    <path
                      d="M5.86328989,11.8109857 L5.86337067,5.67563137 C5.86337067,5.39922654 6.09447855,5.17436281 6.37873882,5.17436281 C6.66291831,5.17436281 6.89410697,5.39922654 6.89410697,5.67563137 L6.89410697,11.8138141 C6.89410697,12.090219 6.66291831,12.3150827 6.37873882,12.3150827 C6.10554523,12.3150827 5.87427579,12.0888833 5.86328989,11.8109857 Z M9.10598952,11.8138141 L9.10598952,5.67563137 C9.10598952,5.39922654 9.3370974,5.17436281 9.62135766,5.17436281 C9.90545638,5.17436281 10.136645,5.39922654 10.136645,5.67563137 L10.136645,11.8138141 C10.136645,12.090219 9.90545638,12.3150827 9.62135766,12.3150827 C9.3370974,12.3150827 9.10598952,12.090219 9.10598952,11.8138141 Z M5.63977521,1.79025006 C5.48290296,1.79025006 5.35995777,1.90983169 5.35995777,2.06241218 L5.35995777,2.71516127 L10.6527402,2.71516127 L10.6527402,2.06241218 C10.6527402,1.90983169 10.529795,1.79025006 10.3729228,1.79025006 L5.63977521,1.79025006 Z M3.39097679,13.1642536 C3.39097679,13.7340341 3.86757116,14.1975111 4.45329756,14.1975111 L11.5467181,14.1975111 C12.1325253,14.1975111 12.6090389,13.7340341 12.6090389,13.1642536 L12.6090389,3.70536309 L3.39097679,3.70536309 L3.39097679,13.1642536 Z M4.45329756,15.2000482 C3.2991314,15.2000482 2.36024049,14.2867652 2.36024049,13.1642536 L2.36024049,3.71769838 L0.515335611,3.71769838 C0.231156121,3.71769838 4.82412063e-05,3.49283465 4.82412063e-05,3.21642982 C4.82412063e-05,2.940025 0.231156121,2.71516127 0.515335611,2.71516127 L4.34190373,2.71516127 L4.34190373,2.06241218 C4.34190373,1.36637172 4.92415665,0.800048241 5.63977521,0.800048241 L10.3729228,0.800048241 C11.0885413,0.800048241 11.6707942,1.36637172 11.6707942,2.06241218 L11.6707942,2.71516127 L15.4846801,2.71516127 C15.7736255,2.71516127 16.0000482,2.9299682 16.0000482,3.20409453 C16.0000482,3.48049936 15.7688596,3.70536309 15.4846801,3.70536309 L13.6397752,3.70536309 L13.6397752,13.1642536 C13.6397752,14.2867652 12.7008035,15.2000482 11.5467181,15.2000482 L4.45329756,15.2000482 Z"
                      fill="#999999"
                    ></path>
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </div>
        <div
          style="width: calc(100% - 120px)"
          class="
            pl-2
            whitespace-nowrap
            break-all
            transform
            -translate-x-16
            transition-all
            group-hover:translate-x-0
          "
        >
          {{ inspiration.content }}
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from "vue";
import keyboard from "../components/keyboards.vue";
export default {
  components: { keyboard },
  props: ["inspiration", "singleLine"],
  emits: ["changeItem", "deleteItem", "toggleItem"],
  setup() {
    let isEditing = ref<boolean>(false);
    let editingContent = ref<string>("");
    let inputRef = ref<any>(null);
    const inputfocus = () => {
      setTimeout(() => {
        inputRef.value.focus();
      });
    };
    return {
      isEditing,
      editingContent,
      inputRef,
      inputfocus,
    };
  },
};
</script>
