import { Component, OnInit, ViewChild } from '@angular/core';
import * as jsfeat from 'jsfeat';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('hardwareVideo') hardwareVideo: any;
  constraints: any;
  canvas: any;
  context: any;
  img_u8: any;

  constructor(){}

  ngOnInit(){
    this.constraints = {
      audio: false,
      video: {
        width: {ideal:640},
        height: {ideal:280}
      }
    };

    this.img_u8 = new jsfeat.matrix_t(640, 480, jsfeat.U8C1_t);

    this.videoStart();
  }

  videoStart(){
    let video = this.hardwareVideo.nativeElement;
    let n = <any>navigator;

    n.getUserMedia = ( n.getUserMedia || n.webkitGetUserMedia || n.mozGetUserMedia  || n.msGetUserMedia );

    n.mediaDevices.getUserMedia(this.constraints).then(function(stream) {
      if ("srcObject" in video) {
        video.srcObject = stream;
      } else {
        video.src = window.URL.createObjectURL(stream);
      }
      video.onloadedmetadata = function(e) {
        video.play();
      };
    });

    this.canvas = document.getElementById('canvas');
    this.context = this.canvas.getContext('2d');

    this.loop();
  }

  loop = () =>{
    this.context.drawImage(this.hardwareVideo.nativeElement, 0, 0, this.canvas.width, this.canvas.height);
    var imageData = this.context.getImageData(0, 0, 640, 480);

    jsfeat.imgproc.grayscale(imageData.data, 640, 480, this.img_u8);

    var r = 10|0;
    var kernel_size = (r+1) << 1;
    jsfeat.imgproc.gaussian_blur(this.img_u8, this.img_u8, kernel_size, 0);

    var data_u32 = new Uint32Array(imageData.data.buffer);
    var alpha = (0xff << 24);
    var i = this.img_u8.cols*this.img_u8.rows, pix = 0;
    while(--i >= 0) {
        pix = this.img_u8.data[i];
        data_u32[i] = alpha | (pix << 16) | (pix << 8) | pix;
    }
    this.context.putImageData(imageData, 0, 0);

    requestAnimationFrame(this.loop);
  }
}
