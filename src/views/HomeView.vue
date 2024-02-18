<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/css/index.css';
import Swal from 'sweetalert2'
import ProductModal from '@/components/ProductModal.vue';

const { VITE_URL, VITE_PATH } = import.meta.env;
const productsData = ref();
const cartData = ref({});
const productModal = ref();
const tempProduct = ref({});
const loadingItems = ref([]);
const formRef = ref();
const orderForm = ref({
  user: {
    email: "",
    name: "",
    tel: "",
    address: "",
  },
  message: ""
});

function getProducts() {
  loadingItems.value.push("fullPage")
  axios.get(`${VITE_URL}/v2/api/${VITE_PATH}/products/all`)
    .then(res => {
      productsData.value = res.data.products;
    })
    .catch(err => {
      console.log(err)
    })
    .finally(() => {
      loadingItems.value.splice(loadingItems.value.indexOf("fullPage"), 1)
    })
}
function getCarts() {
  loadingItems.value.push("cart")
  axios.get(`${VITE_URL}/v2/api/${VITE_PATH}/cart`)
    .then(res => {
      cartData.value = res.data.data;
    })
    .catch(err => {
      console.log(err)
    })
    .finally(() => {
      loadingItems.value.splice(loadingItems.value.indexOf("cart"), 1)
    })
}
function showModal(product) {
  tempProduct.value = product;
  console.log(tempProduct.value)
  productModal.value.dialog.showModal()
}
function addToCart(product_id, qty = 1) {
  loadingItems.value.push(product_id);
  axios.post(`${VITE_URL}/v2/api/${VITE_PATH}/cart`, {
    data: {
      product_id,
      qty
    }
  })
    .then(() => {
      getCarts();
      productModal.value.dialog.close();
    })
    .catch(err => {
      console.log(err)
    })
    .finally(() => {
      loadingItems.value.splice(loadingItems.value.indexOf(product_id), 1)
    })
}
const updateCart = debounce((product_id, qty = 1) => {
  axios.put(`${VITE_URL}/v2/api/${VITE_PATH}/cart/${product_id}`, {
    data: {
      product_id,
      qty
    }
  })
    .then(res => {
      console.log(res)
      getCarts();
    })
    .catch(err => {
      console.log(err)
    })
})
function debounce(fn) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, 750);
  };
}
function deleteCart(id) {
  loadingItems.value.push(id);
  axios.delete(`${VITE_URL}/v2/api/${VITE_PATH}/cart/${id}`)
    .then(res => {
      console.log(res)
      getCarts()
    }).catch(err => {
      console.log(err);
    }).finally(() => {
      loadingItems.value.splice(loadingItems.value.indexOf(id), 1)
    })
}
// VeeValidation 手機驗證
function isPhone(value) {
  const phoneNumber = /^(09)[0-9]{8}$/;
  return phoneNumber.test(value) ? true : "請輸入正確的電話號碼"
}
// 送出訂單
function submitOrder() {
  if (cartData.value.carts.length === 0) {
    Swal.fire({
      icon: "error",
      title: "目前沒有東西在購物車喔~"
    })
    return
  }
  loadingItems.value.push("order")
  axios.post(`${VITE_URL}/v2/api/${VITE_PATH}/order`, { data: orderForm.value })
    .then(res => {
      Swal.fire({
        title: res.data.message,
        icon: "success"
      })
      getCarts();
      formRef.value.resetForm();
    })
    .catch(err => {
      console.log(err)
    })
    .finally(() => {
      loadingItems.value.splice(loadingItems.value.indexOf("order"), 1)
    })
}
onMounted(() => {
  getProducts();
  getCarts();
})
</script>
<template>
  <main>
    <Loading :active="loadingItems.includes('fullPage')" :fullPage="true" transition="fade" />
    <div class="container mx-a">
      <!-- 產品列表 -->
      <table class="w-100% mt-6 mb-4">
        <thead>
          <tr class="font-bold text-left border-(b black solid )">
            <th>圖片</th>
            <th>商品名稱</th>
            <th>價格</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-(b solid #eee)" v-for="product in productsData" :key="product.id">
            <td class="w-200px">
              <div class="h-100px bg-(center cover)" :style="{ backgroundImage: `url('${product.imageUrl}')` }">
              </div>
            </td>
            <td>
              {{ product.title }}
            </td>
            <td>
              <div class="font-size-5" v-if="product.price === product.origin_price"> {{ product.price }} 元</div>
              <div v-else>
                <del class="font-size-4">原價 {{ product.origin_price }} 元</del>
                <div class="font-size-5">現在只要 {{ product.price }} 元</div>
              </div>
            </td>
            <td>
              <div>
                <button type="button"
                  class="bg-transparent text-#6c757d px2 py-1 border-(1 r-0 solid #6c757d) rd-(tl bl) hover:(bg-#6c757d text-white cursor-pointer) "
                  @click="showModal(product)"
                  :class="{ 'op-50 cursor-not-allowed relative': loadingItems.includes(product.id) }"
                  :disabled="loadingItems.includes(product.id)">
                  <div
                    class="i-svg-spinners:12-dots-scale-rotate absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    v-if="loadingItems.includes(product.id)"></div>
                  <span>
                    查看更多
                  </span>
                </button>
                <button type="button"
                  class="bg-transparent text-red px2 py-1 border-(1 solid red) rd-(tr br) hover:(bg-red text-white cursor-pointer) "
                  @click="addToCart(product.id)"
                  :class="{ ' cursor-not-allowed relative': loadingItems.includes(product.id) }"
                  :disabled="loadingItems.includes(product.id)">
                  <div
                    class="i-svg-spinners:12-dots-scale-rotate absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    v-if="loadingItems.includes(product.id)"></div>
                  <span :class="{ 'op-50': loadingItems.includes(product.id) }">加到購物車</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- 購物車 -->
      <template v-if="cartData.carts">
        <p class="text-center py-10" v-if="cartData.carts.length === 0">目前購物車沒有東西呦╮(╯_╰)╭</p>
        <div v-else>
          <div class="text-end">
            <button
              class="bg-transparent text-red px-3 py-1.5 border-(1 solid red) rd hover:(bg-red text-white cursor-pointer)">清空購物車</button>
          </div>
          <table class="w-100% relative">
            <Loading :active="loadingItems.includes('cart')" :is-full-page="false" transition="fade" />
            <thead>
              <tr>
                <th></th>
                <th class="text-start">品名</th>
                <th class="w-150px">數量/單位</th>
                <th>單價</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="cartData.carts">
                <tr v-for="item in cartData.carts" :key="item.id" class="border-(b solid #eee)">
                  <td>
                    <button type="button"
                      class="bg-transparent text-red px2 py-1 border-(1 solid red) rd hover:(bg-red text-white cursor-pointer)"
                      :class="{ ' cursor-not-allowed relative': loadingItems.includes(item.id) }"
                      :disabled="loadingItems.includes(item.id)" @click="deleteCart(item.id)">
                      <div
                        class="i-svg-spinners:12-dots-scale-rotate absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        v-if="loadingItems.includes(item.id)"></div>
                      X
                    </button>
                  </td>
                  <td>
                    {{ item.product.title }}
                    <div class="text-#198754" v-if="item.coupon">
                      已套用優惠券
                    </div>
                  </td>
                  <td>
                    <div>
                      <div class="flex mb-3">
                        <input min="1" type="number" class="p-(x-3 y-1.5) border-(1 solid #dee2e6) rd-(tl bl)"
                          v-model.number="item.qty" @change="updateCart(item.id, item.qty)">
                        <span class="inline-block bg-#f8f9fa p-(x-3 y-1.5) border-(1 solid #dee2e6) rd-(tr br)">{{
                          item.product.unit
                        }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="text-end">
                    <small class="text-#198754" v-if="cartData.final_total !== cartData.total">折扣價：</small>
                    {{ item.final_total }}
                  </td>
                </tr>
              </template>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="text-end">總計</td>
                <td class="text-end">{{ cartData.final_total }}</td>
              </tr>
              <tr v-if="cartData.final_total !== cartData.total">
                <td colspan="3" class="text-end text-#198754">折扣價</td>
                <td class="text-end text-#198754">{{ cartData.total - cartData.final_total }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </template>


      <!-- 表單 -->
      <div class="mb-12 relative">
        <Loading :active="loadingItems.includes('order')" :is-full-page="false" />
        <VForm class="w-50% mx-a" v-slot="{ errors }" @submit="submitOrder" ref="formRef">
          <div class="mb-4">
            <label for="email" class="inline-block mb-2">Email</label>
            <VField type="email" name="email" id="email" class="block w-100% p-(x-3 y-1.5) border-(1 solid #dee2e6) rd"
              :class="{ 'invalid': errors['email'] }" placeholder="請輸入 Email" rules="required|email"
              v-model="orderForm.user.email" />
            <ErrorMessage name="email" class="text-red font-size-3" />
          </div>
          <div class="mb-4">
            <label for="姓名" class="inline-block mb-2">姓名</label>
            <VField type="text" name="姓名" id="name" class="block w-100% p-(x-3 y-1.5) border-(1 solid #dee2e6) rd"
              :class="{ 'invalid': errors['姓名'] }" rules="required" placeholder="請輸入 姓名" v-model="orderForm.user.name" />
            <ErrorMessage name="姓名" class="text-red font-size-3" />
          </div>
          <div class="mb-4">
            <label for="電話" class="inline-block mb-2">電話</label>
            <VField type="tel" name="電話" id="tel" class="block w-100% p-(x-3 y-1.5) border-(1 solid #dee2e6) rd"
              :class="{ 'invalid': errors['電話'] }" :rules="isPhone" placeholder="請輸入 電話" v-model="orderForm.user.tel" />
            <ErrorMessage name="電話" class="text-red font-size-3" />
          </div>
          <div class="mb-4">
            <label for="地址" class="inline-block mb-2">地址</label>
            <VField type="address" name="地址" id="address" class="block w-100% p-(x-3 y-1.5) border-(1 solid #dee2e6) rd"
              :class="{ 'invalid': errors['地址'] }" rules="required" placeholder="請輸入 地址"
              v-model="orderForm.user.address" />
            <ErrorMessage name="地址" class="text-red font-size-3" />
          </div>
          <div class="mb-4">
            <label for="message" class="inline-block mb-2">留言(非必須)</label>
            <VField as="textarea" name="orderForm.message" id="message" cols="30" rows="10"
              class="block w-100% p-(x-3 y-1.5) border-(1 solid #dee2e6) rd" v-model="orderForm.message" />
          </div>
          <div class="text-end">
            <button type="submit"
              class="p-(x-3 y-1.5) bg-red text-white border-0 rd hover:(bg-#bb2d3b cursor-pointer)">送出訂單</button>
          </div>
        </VForm>
      </div>
    </div>
  </main>
  <ProductModal ref="productModal" :temp-product="tempProduct" @add-to-cart="addToCart"></ProductModal>
</template>
<style lang="postcss">
td,
th {
  @apply p-2 align-middle;
}

form input:focus {
  @apply outline-0 border-#86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, .25);
}

.invalid {
  @apply border-red border-2;
}
</style>