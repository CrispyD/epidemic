import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberKMBT'
})
export class NumberKMBTPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return postFix_kMBT(value,args);
  }

}
function postFix_kMBT(x, digits) {
  const scale = Math.pow(10,digits)
  if (x >= 1e-3 && x < 1e0) { return Math.round(x*scale)/scale +' '}
  if (x >= 1e0 && x < 1e3) { return Math.round(x*scale)/scale +' '}
  if (x >= 1e3 && x < 1e6) { return Math.round(x*scale * 1e-3)/scale + 'k' }
  if (x >= 1e6 && x < 1e9) { return Math.round(x*scale * 1e-6)/scale + 'M' }
  if (x >= 1e9 && x < 1e12) { return Math.round(x*scale * 1e-9)/scale + 'B' }
  if (x >= 1e12 && x < 1e15) { return Math.round(x*scale * 1e12)/scale + 'T' }
}