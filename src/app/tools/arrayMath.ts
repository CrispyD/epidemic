export const trueArray = (n) => Array(n).fill(true)
export const falseArray = (n) => Array(n).fill(false)
export const ones  = (n) => Array(n).fill(1.0)
export const zeros = (n) => Array(n).fill(0.0)
export const range = (start, stop, step = 1) => 
    Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step)
    
export const sum = (x) => x.reduce((total, element) => total + element,0)

export const add = (x,y) => maybeArray(x,y,(a,b)=>a+b)
export const subtract = (x,y) => maybeArray(x,y,(a,b)=>a-b)
export const multiply = (x,y) => maybeArray(x,y,(a,b)=>a*b)
export const divide = (x,y) => maybeArray(x,y,(a,b)=>a/b)

export const minimum = (x,y)=> maybeArray(x,y, Math.min) 
export const maximum = (x,y)=> maybeArray(x,y, Math.max) 


export const not = (arr) => arr.map((element) => !element)
export const any = (arr) => arr.reduce((check,element) => check | element)
const isNaN_aM = (arr) => arr.map((element) => isNaN(element))
export {isNaN_aM as isNaN}; // because it has the same name as a built in function


export const maybeArray = (x,y,func) => {
    if (Array.isArray(x)) {
        if (Array.isArray(y)) {
            return x.map((element, index) => func(element, y[index]) )
        } else {
            return x.map((element) => func(element , y))
        }
    } else {
        if (Array.isArray(y)) {
            return y.map((element) => func(x , element))
        } else {
            return func(x , y)
        }
    } 
 }

 export function setSlice(arr, value, start, end: boolean | number =false) {
     if (end && end < 0) {
         end = arr.length+end
        } else {
            end = arr.length
        }
        
    let vi = 0
     for (let i=start; i < end; i++) {
        arr[i] = value[vi]
        vi ++
     }
     return arr
 }

 export function getMask(arr, mask) {
     return arr.reduce((masked,element,index) => {
         if(mask[index]) { masked.push(element) }
         return masked
        },[])
 }

 export function setMask(arr, value, mask) {
    const valueIsArray = Array.isArray(value)
    let vi = 0
    return arr.map((element,index) => {
        if(mask[index]) {
            if (valueIsArray) {
                arr[index] = value[vi] // update in place
                vi++
            } else {
                arr[index] = value
            }
            return arr[index]
         }
        return element
       })
}

export function repeat(arr, n) {
    const repeated = []
    for (let i=0; i<n; i++) {
        repeated.push([...arr])
    }
    return repeated
}

export function cumsum(arr) {
    return arr.reduce((total, element, ind) => {
        if (ind>0) {
            total.push(element + total.slice(-1)[0])
        } else {
            total.push(element)
        }
        return total
    },[])
}

export function linspace(a,b,n,endpoint=false) {
    const output = []
    const step = (b-a) / n
    if (endpoint) {n++}
    for (let i=0; i<n; i++) { output.push(i*step) }
    return output
}

////////////////////////////////////

export function interp1d(X,Y) {
    const dX = diff(X)
    const dY = diff(Y)
    return (x) => {
        if (x<=X[0]) {return Y[0]} // nearest extrapolation at beginning
        if (x>=X.slice(-1)) { return Y.slice(-1)[0] } // nearest extrapolation at end
        let ind = findBin(X,x)
        return Y[ind] + dY[ind] * (x - X[ind]) / dX[ind]
    }
}

export function logInterp1d(X,Y) {
    const log_y = Y.map( value => Math.log10(value))
    const linInterp = interp1d(X, log_y)
    const logInterp = (x) => Math.pow(10.0, linInterp(x))
    return logInterp
}

export function diff(x) {
    return x.reduce( (dx,_element,index,array) => {
        if (index+1 < array.length) { 
                dx.push(array[index+1] - array[index])
            }
        return dx
        }, [])
    }


function findBin(X,x) { // should be a binary search instead of a linear search...
    return X.findIndex( (element, index, array) => {
        if (index == (array.len-1) ) {return true}
        return x >= array[index] && x < array[index+1]
    } )
}