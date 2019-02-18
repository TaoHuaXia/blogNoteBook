// !!!总结注意！！！
// * 字符串需要注意空字符串，字符串长度为1等异常情况


/*
 * 1.最长回文子串：
 * 给定一个字符串 s，找到 s 中最长的回文子串。你可以假设 s 的最大长度为 1000。
 *
 * 输入: "cbbd"
 * 输出: "bb"
 * */

/**
 * @param {string} s
 * @return {string}
 */

// 自己写的方法：
var longestPalindrome = function(s) {
  let strLength = s.length
  let result = ''
  if (strLength < 2) {
    return s
  }
  for (let i = 0; i < strLength; i++) {
    let currentChar = s[i]
    let str = ''
    let reverseStr = ''
    let isFounded = false
    let lastSameIndex = s.lastIndexOf(currentChar)

    while((lastSameIndex !== -1) && (lastSameIndex > i) && !isFounded) {
      str = s.slice(i, lastSameIndex + 1)
      reverseStr = str.split('').reverse().join('')
      if (str === reverseStr && (str.length > result.length)) {
        result = str
        isFounded = true
      }
      lastSameIndex = s.lastIndexOf(currentChar, lastSameIndex - 1)
    }
  }
  return result === '' ? s[0] : result
};