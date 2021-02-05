import { Component, OnInit, ViewChild } from '@angular/core';
import * as jsfeat from 'jsfeat';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild('hardwareVideo', { static: true }) hardwareVideo: any;
  constraints: any;
  canvas: any;
  context: any;
  img_u8: any;

  constructor() {}

  ngOnInit(): any {
    this.constraints = {
      audio: false,
      video: {
        width: {ideal: 640},
        height: {ideal: 480}
      }
    };

    this.img_u8 = new jsfeat.matrix_t(640, 480, jsfeat.U8C1_t);

    this.videoStart();
  }

  public videoStart(): void {
    const video = this.hardwareVideo.nativeElement;
    const n = <any>navigator;

    n.getUserMedia = ( n.getUserMedia || n.webkitGetUserMedia || n.mozGetUserMedia  || n.msGetUserMedia );

    n.mediaDevices.getUserMedia(this.constraints).then((stream: any) => {
      if ('srcObject' in video) {
        video.srcObject = stream;
      } else {
        video.src = window.URL.createObjectURL(stream);
      }
      video.onloadedmetadata = (e: any) => {
        video.play();
      };
    });

    this.canvas = document.getElementById('canvas');
    this.context = this.canvas.getContext('2d');

    this.loop();
  }

  loop = () => {
    this.context.drawImage(this.hardwareVideo.nativeElement, 0, 0, this.canvas.width, this.canvas.height);
    const imageData = this.context.getImageData(0, 0, 640, 480);

    jsfeat.imgproc.grayscale(imageData.data, 640, 480, this.img_u8);

    const r = 10 | 0;
    const kernel_size = (r+1) << 1;
    jsfeat.imgproc.gaussian_blur(this.img_u8, this.img_u8, kernel_size, 0);

    const data_u32 = new Uint32Array(imageData.data.buffer);
    const alpha = (0xff << 24);
    let i = this.img_u8.cols * this.img_u8.rows, pix = 0;
    while(--i >= 0) {
        pix = this.img_u8.data[i];
        data_u32[i] = alpha | (pix << 16) | (pix << 8) | pix;
    }
    this.context.putImageData(imageData, 0, 0);

    requestAnimationFrame(this.loop);
  }
}
