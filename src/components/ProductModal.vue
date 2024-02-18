<script setup>
import { ref, watch } from 'vue'
const dialog = ref();
const props = defineProps(['tempProduct'])
const product = ref({});
const qty = ref(1)
function autoClose(e) {
    // 點擊 dialog 外圍區域自動關閉
    if (e.target.nodeName === "DIALOG") {
        dialog.value.close();
    }
}
defineExpose({
    dialog
})
watch(() => props.tempProduct, () => {
    product.value = { ...props.tempProduct }
})
</script>
<template>
    <dialog ref="dialog" class="max-w-1140px w-100% border-0 rd p-0 backdrop:backdrop-blur-3" @click="autoClose">
        <form method="dialog">
            <div class="bg-#212529 p-4 mb-4 text-right">
                <button type="button" class="i-ic:baseline-close p-2 text-white font-size-4 hover:cursor-pointer"
                    @click="dialog.close()"></button>
            </div>
            <div class="grid grid-cols-2 gap-6 px-4">
                <div>
                    <img :src="product.imageUrl" alt="">
                </div>
                <div class="flex flex-col">
                    <div>
                        <span class="inline-block font-size-3 px-2 py-1 bg-#0d6efd text-white rd-100">{{ product.category
                        }}</span>
                    </div>
                    <h3 class="font-size-5 font-bold">商品敘述：</h3>
                    <p class="mb-4">{{ product.description }}</p>
                    <h3 class="font-size-5 font-bold">商品內容：</h3>
                    <p>{{ product.content }}</p>
                    <div class="font-size-6" v-if="product.price === product.origin_price">{{ product.price }}元</div>
                    <div v-else class="mt-a mb-4">
                        <del class="font-size-5">原價{{ product.origin_price }}元</del>
                        <div class="font-size-6">現在只要{{ product.price }}</div>
                    </div>
                    <div class="mb-4 flex w-100%">
                        <input type="number" name="" id="" min="1"
                            class="flex-1 px-3 py-1.5 border-(1 solid #dee2e6 ) rd-(tl bl)" v-model="qty">
                        <button type="button"
                            class="bg-#0d6efd border-(1 solid #0d6efd) text-white rd-(tr br) hover:(bg-#0a58ca cursor-pointer)"
                            @click="$emit('addToCart', product.id, qty)">加入購物車</button>
                    </div>
                </div>
            </div>
            <button type="submit">Close</button>
        </form>
    </dialog>
</template>