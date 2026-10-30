import { Component } from '@angular/core';
import { Html5Qrcode, Html5QrcodeScanner } from 'html5-qrcode';

@Component({
   selector: 'app-mobile-barcode-scanner',
   standalone: true,
   templateUrl: './mobile-barcode-scanner.html'
})
export class MobileBarcodeScanner {
   

   startScanner = async () => {
      const scanner = new Html5Qrcode("reader");

      

      await scanner.start(
         { facingMode: 'environment' },
         {
            fps: 10,
            qrbox: 250
         },
         (decodedText) => {
            alert(decodedText);
            scanner.stop();
         },
         (error) => {
            alert('error: ' + error)
         }
      )
   }
}
