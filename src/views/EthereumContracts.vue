<template>
  <div class="EthereumContracts">
    <EthereumInfo/>
  </div>
</template>

<script>
// @ is an alias to /src
import EthereumInfo from '@/components/EthereumInfo.vue'

export default {
  name: 'EthereumContracts',
  components: {
    EthereumInfo
  }
}
</script>
