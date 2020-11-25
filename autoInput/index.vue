<template>
  <div class="container">
    <el-input
      ref="input"
      :value="value"
      :type="type"
      :readonly="readonly"
      :disabled="disabled"
      v-bind="$attrs"
      v-on="$listeners"
      @keydown.up.native="event => upOrDown('up', event)"
      @keydown.down.native="event => upOrDown('down', event)"
      @keydown.enter.native="handleKeyEnter"
      @keydown.esc.native="changeVisible(false)"
      @blur="changeVisible(false)"
      @focus="onFouce(value)"
      @input="changeValue"
    />
    <div
      v-show="suggestionBoxVisible && suggestions.length > 0"
      ref="suggestions"
      class="el-autocomplete-suggestion box-style"
      :style="suggestionBoxPosition"
    >
      <ul class="el-scrollbar__view el-autocomplete-suggestion__list">
        <li
          v-for="(item, index) in suggestions"
          :key="index"
          :class="{'highlighted': highlightedIndex === index}"
          @click="select(item)"
        >
          <slot :item="item">
            {{ item[valueKey] }}
          </slot>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import debounce from 'throttle-debounce/debounce'
import inputTool from './tool'
export default {
  name: 'autoInput',
  props: {
    value: {
      type: [String, Boolean],
      default: ''
    },
    valueKey: {
      type: String,
      default: 'value'
    },
    fetchSuggestions: {
      type: Function,
      default: () => {}
    },
    readonly: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: ''
    },
    triggerWhenUninput: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      highlightedIndex: 0,
      suggestionBoxVisible: false,
      suggestionBoxPosition: 'left:10px;top:20px;',
      $_input: null,
      suggestions: [],
      debouncedGetData: null
    }
  },
  watch: {
    value: {
      handler() {

      },
      immediate: true
    }
  },
  mounted() {
    this._$input = this.getInput()
    this.debouncedGetData = debounce(100, this.getData)
  },
  methods: {
    select(item) {
      this.$emit('input', this.operateCurrentLineData(this.value, item[this.valueKey]))
      this.$emit('select', item)
    },
    changeValue(value) {
      this.$emit('input', value)
      this.debouncedGetData(this.operateCurrentLineData(value))
    },
    onFouce(value) {
      if (this.triggerWhenUninput) {
        this.debouncedGetData(this.operateCurrentLineData(value))
      }
    },
    getData(queryString) {
      const cursorPosition = inputTool.getInputPositon(this._$input)
      const inputPosition = inputTool._offset(this._$input)
      const left = cursorPosition.left - inputPosition.left + 5
      const top = cursorPosition.top - inputPosition.top - this._$input.scrollTop + 12
      if (this.triggerWhenUninput || queryString.trimLeft()) {
        this.fetchSuggestions(queryString.trimLeft(), (suggestions) => {
          if (Array.isArray(suggestions)) {
            this.suggestions = suggestions
            this.highlightedIndex = 0
            this.setSuggestionPostion(left, top)
          } else {
            console.error('[Element Error][Autocomplete]autocomplete suggestions must be an array')
          }
        })
      }
    },
    operateCurrentLineData(value, replaceValue) {
      const fontLength = inputTool._getFocus(this._$input)
      const valueArray = value.split(/\n/)
      let length = 0
      for (let i = 0; i < valueArray.length; i++) {
        length += valueArray[i].length
        if (length >= fontLength) {
          if (typeof replaceValue === 'undefined') {
            return valueArray[i]
          }
          valueArray[i] = replaceValue
          return valueArray.join('\n')
        }
        length += 1
      }
    },
    getInput() {
      return this.$refs.input.getInput()
    },
    changeVisible(visible) {
      if (!(this.readonly || this.disabled)) {
        setTimeout(() => { this.suggestionBoxVisible = visible }, 100)
      }
    },
    setSuggestionPostion(left = 0, top = 0) {
      this.suggestionBoxPosition = `left:${left}px;top:${top}px;`
      this.changeVisible(true)
    },
    upOrDown(key, e) {
      if (this.suggestionBoxVisible) {
        e.preventDefault()
        key === 'up' && this.highlight(this.highlightedIndex - 1)
        key === 'down' && this.highlight(this.highlightedIndex + 1)
      }
    },
    highlight(index) {
      if (index < 0) {
        this.highlightedIndex = 0
        return
      }
      if (index >= this.suggestions.length) {
        index = this.suggestions.length - 1
      }
      const suggestion = this.$refs.suggestions
      const suggestionList = suggestion.querySelectorAll('.el-autocomplete-suggestion__list li')
      const highlightItem = suggestionList[index]
      const scrollTop = suggestion.scrollTop
      const offsetTop = highlightItem.offsetTop

      if (offsetTop + highlightItem.scrollHeight > (scrollTop + suggestion.clientHeight)) {
        suggestion.scrollTop += highlightItem.scrollHeight
      }
      if (offsetTop < scrollTop) {
        suggestion.scrollTop -= highlightItem.scrollHeight
      }
      this.highlightedIndex = index
    },
    handleKeyEnter(event) {
      if (this.suggestionBoxVisible) {
        event.preventDefault()
        this.select(this.suggestions[this.highlightedIndex])
        this.changeVisible(false)
      }
    }
  }
}
</script>

<style scoped>
  .container {
    position: relative;
  }
  .box-style {
    position: absolute;
    z-index:99;
    width: 100%;
    max-height: 200px;
    overflow: auto;
    margin: 0;
    padding: 5px 0;
  }
</style>
