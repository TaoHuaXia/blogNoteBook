/*
 * 1.两数求和：
 * 给定一个整数数组 nums 和一个目标值 target，请你在该数组中找出和为目标值的那 两个 整数，并返回他们的数组下标。
 * 你可以假设每种输入只会对应一个答案。但是，你不能重复利用这个数组中同样的元素。
 *
 * 给定 nums = [2, 7, 11, 15], target = 9
 * 返回 [0, 1]
 * */

/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */

// 第一版：
// 通过嵌套遍历寻找是否有合适的值
// 优点：
// 由于[0, 1, 2, 3]，当第一层遍历到1时，1已经跟0匹配过了，所以不需要再从起点开始遍历，
// 这样每次遍历第二层遍历的次数都会减少（j = i + 1）
// 缺点：
// 时间复杂度还是太高
var twoSum1 = function (nums, target) {
    let arrLength = nums.length
    for (let i = 0; i < arrLength; i++) {
      let targetNum = target - nums[i]
      for (let j = i + 1; j < arrLength; j++) {
        if (nums[j] === targetNum) {
          return [i, j]
        }
      }
    }
  };

// 优化版本：
// 将数值作为键存入对象，利用键代替数组的遍历去快速判定是否有对应的数字
// 优点：
// 时间复杂度为O(n)，使用对象巧妙得处理了数字的查询
var twoSum2 = function (nums, target) {
  let map = {}
  let arrLength = nums.length
  for (let i = 0; i < arrLength; i++) {
    let currentNum = nums[i]
    let targetNum = target - currentNum
    if (map[targetNum] !== undefined) {
      return [map[targetNum], i]
    } else {
      // 由于题目规定正确值只有一个，所以不需要考虑重复数值的问题，否则需要考虑相同数字的问题
      map[currentNum] = i
    }
  }
};


// 两个有序数组合并为新的有序数组(向第一个数组插入，称为新数组)

var merge1 = function(arr1, arr2) {
  // 上次插入的位置，由于数组本身是有序的，所以再插入后，后续可直接从上次的索引开始进行比较
  var currentIndex = 0
  var len1 = arr1.length
  var len2 = arr2.length
  while (len2 > 0) {
    var currentItem = arr2.shift()
    for (var i = currentIndex; i < len1; i++) {
      // 如果当前值比数组中的某个值小，则在该索引插入
      if (arr1[i] > currentItem) {
        arr1.splice(i, 0, currentItem)
        currentIndex = i + 1
        currentItem = null
        break
      }
    }
    // 特殊情况，如果在目标数组中没有找到比当前值小的，则直接放至尾部
    if (currentItem !== null) {
      currentIndex = len1 + 1
      arr1.push(currentItem)
    }
    // 每次插入数组1的长度+1，数组2的长度减1
    len1++
    len2--
  }
  return arr1
}

// 两个有序数组合并为新的有序数组(重新声明一个新数组)

var merge2 = function(arr1, arr2) {
  var len1 = arr1.length
  var len2 = arr2.length
  var result = []
  // 通过比较数组第一个值的大小来将较小值推进数组，由于两个数组都是有序的，所以可以通过这种方式进行快速处理，时间复杂度为Max(m, n)
  while (len1 > 0 && len2 > 0) {
    var item1 = arr1[0]
    var item2 = arr2[0]
    if (item1 < item2) {
      result.push(arr1.shift())
      len1--
    } else {
      result.push(arr2.shift())
      len2--
    }
  }
  return result
}

// 冒泡排序
// 时间复杂度O(n^2)
var popSort = function(array) {
  if (!array || !Array.isArray(array)) {
    throw new Error('popSort needs an array')
  }
  let result = array.concat()
  let len = array.length
  for (let i = 0; i < len; i++) {
    for(let j = len - 1; j > i; j--) {
      let current = result[j]
      let prev = result[j - 1]
      if (current < prev) {
        let temp = prev
        result[j - 1] = current
        result[j] = temp
        temp = null
      }
    }
  }
  return result
}

// 快速排序:冒泡排序的改进
var quickSort = function(arr, from, to) {
  if (!arr || !Array.isArray(arr)) {
    throw new Error('fastSort needs an array')
  }
  if (to <= from) {
    return
  }
  let len = arr.length
  from = typeof from !== 'number' ? 0 : from
  to = typeof to !== 'number' ? len : to
  let middleIndex = from + ((to - from) >> 1)
  let middleItem = arr[middleIndex]
  arr[middleIndex] = arr[from]
  arr[from] = middleItem
  let low_end = from + 1

  for (let i = from + 1; i < to; i ++) {
    if (arr[i] < middleItem) {
      swap(arr, i, low_end)
      low_end++
    }
  }
  swap(arr, from, low_end - 1)
  quickSort(arr, from, low_end - 1)
  quickSort(arr, low_end, to)
}

function swap (arr, index1, index2) {
  if (index1 === index2) return
  let temp = arr[index1]
  arr[index1] = arr[index2]
  arr[index2] = temp
}

// function ArraySort(comparefn) {
//   // In-place QuickSort algorithm.
//   // For short (length <= 22) arrays, insertion sort is used for efficiency.
//
//   var custom_compare = IS_FUNCTION(comparefn);
//
//   function InsertionSort(a, from, to) {
//     for (var i = from + 1; i < to; i++) {
//       var element = a[i];
//       // Pre-convert the element to a string for comparison if we know
//       // it will happen on each compare anyway.
//       var key =
//         (custom_compare || %_IsSmi(element)) ? element : ToString(element);
//       // place element in a[from..i[
//       // binary search
//       var min = from;
//       var max = i;
//       // The search interval is a[min..max[
//       while (min < max) {
//         var mid = min + ((max - min) >> 1);
//         var order = Compare(a[mid], key);
//         if (order == 0) {
//           min = max = mid;
//           break;
//         }
//         if (order < 0) { 从
//           min = mid + 1;
//         } else {
//           max = mid;
//         }
//       }
//       // place element at position min==max.
//       for (var j = i; j > min; j--) {
//         a[j] = a[j - 1];
//       }
//       a[min] = element;
//     }
//   }
//
//   function QuickSort(a, from, to) {
//     // Insertion sort is faster for short arrays.
//     if (to - from <= 22) {
//       InsertionSort(a, from, to);
//       return;
//     }
//     var pivot_index = $floor($random() * (to - from)) + from;
//     var pivot = a[pivot_index];
//     // Pre-convert the element to a string for comparison if we know
//     // it will happen on each compare anyway.
//     var pivot_key =
//       (custom_compare || %_IsSmi(pivot)) ? pivot : ToString(pivot);
//     // Issue 95: Keep the pivot element out of the comparisons to avoid
//     // infinite recursion if comparefn(pivot, pivot) != 0.
//     a[pivot_index] = a[from];
//     a[from] = pivot;
//     var low_end = from;   // Upper bound of the elements lower than pivot.
//     var high_start = to;  // Lower bound of the elements greater than pivot.
//     // From low_end to i are elements equal to pivot.
//     // From i to high_start are elements that haven't been compared yet.
//     for (var i = from + 1; i < high_start; ) {
//       var element = a[i];
//       var order = Compare(element, pivot_key);
//       if (order < 0) {
//         a[i] = a[low_end];
//         a[low_end] = element;
//         i++;
//         low_end++;
//       } else if (order > 0) {
//         high_start--;
//         a[i] = a[high_start];
//         a[high_start] = element;
//       } else {  // order == 0
//         i++;
//       }
//     }
//     QuickSort(a, from, low_end);
//     QuickSort(a, high_start, to);
//   }
//
//   var old_length = ToUint32(this.length);
//   if (old_length < 2) return this;
//
// %RemoveArrayHoles(this);
//
//   var length = ToUint32(this.length);
//
//   // Move undefined elements to the end of the array.
//   for (var i = 0; i < length; ) {
//     if (IS_UNDEFINED(this[i])) {
//       length--;
//       this[i] = this[length];
//       this[length] = void 0;
//     } else {
//       i++;
//     }
//   }
//
//   QuickSort(this, 0, length);
//
//   // We only changed the length of the this object (in
//   // RemoveArrayHoles) if it was an array.  We are not allowed to set
//   // the length of the this object if it is not an array because this
//   // might introduce a new length property.
//   if (IS_ARRAY(this)) {
//     this.length = old_length;
//   }
//
//   return this;
// }


