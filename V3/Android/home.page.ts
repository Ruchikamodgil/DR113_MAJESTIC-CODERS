import { Component } from '@angular/core';
import { Plugins, CameraResultType, CameraSource} from '@capacitor/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import * as cvstfjs from '@microsoft/customvision-tfjs';

import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireDatabaseModule, AngularFireDatabase } from '@angular/fire/database';

import { Observable } from 'rxjs';
import { finalize, tap, timestamp } from 'rxjs/operators';

//import { Geolocation } from '@ionic-native/geolocation/ngx';

import { environment } from '../../environments/environment'

import * as firebase from 'firebase';
import { FileSizeFormatPipe } from './file-size-format.pipe'
import { stringify } from 'querystring';

export interface MyData {
  name: string;
  filepath: string;
  size: number;
}
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})


export class HomePage {

  // Upload Task 
  task: any;

  // Progress in percentage
  percentage: Observable<number>;

  // Snapshot of uploading file
  snapshot: Observable<any>;

  // Uploaded File URL
  UploadedFileURL: Observable<string>;

  //Uploaded Image List
  images: Observable<MyData[]>;

  //File details  
  fileName:string;
  fileSize:number;

  //Status check 
  isUploading:boolean;
  isUploaded:boolean;

  photo: SafeResourceUrl;

  private imageCollection: AngularFirestoreCollection<MyData>;

  constructor(private storage: AngularFireStorage,
     private database: AngularFirestore,
     private sanitizer: DomSanitizer,
     private afdb: AngularFireDatabase
     //private geolocation: Geolocation
     ) {
    this.isUploading = false;
    this.isUploaded = false;
    //Set collection where our documents/ images info will save
    this.imageCollection = database.collection<MyData>('cowimages');

    
    this.images = this.imageCollection.valueChanges();
  }

  


  async takePicture() {
    debugger
    const image = await Plugins.Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    })
    debugger
    this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.dataUrl))
console.log(this.photo)
    const file = image
console.log(file)
    const path = `cowimages/${new Date().getTime()}_takenFormCamera`;

    const customMetadata = { app: 'Aghanya App Image upload' }; 
this.updateDB(path,file.dataUrl,customMetadata)
    //this.task = this.storage.upload(path, file, { customMetadata });
  }
  

    // Validation for Images Only
  
    // getlocation(){

    //   this.geolocation.getCurrentPosition().then((resp) => {
    //     console.log(resp);
    //     let location = {
    //       latitude : resp.coords.latitude,
    //       longitude : resp.coords.longitude
    //     }
    //     return location;
    //    }).catch((error) => {
    //      console.log('Error getting location', error);
    //    });
       
      //  let watch = this.geolocation.watchPosition();
      //  watch.subscribe((data) => {
      //   // data can be a set of coordinates, or an error (if an error occurred).
      //   // data.coords.latitude
      //   // data.coords.longitude
      //  });

   // }

   updateDB(path,file,customMetadata){
    this.storage.upload(path, file, { customMetadata })
    .then(res => {
      console.log(res)
    debugger
      if(res){
        res.ref.getDownloadURL().then(url=>{
          debugger
          this.afdb.database.app.database().ref('cowimages/').push({
            location: '27.34,32.34',
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            image_url: url
          });
        })
      }
    });
   }

  uploadFile(event: FileList) {
    

    // The File object
    const file = event.item(0)

    // Validation for Images Only
    if (file.type.split('/')[0] !== 'image') { 
     console.error('unsupported file type :( ')
     return;
    }

    this.isUploading = true;
    this.isUploaded = false;


    this.fileName = file.name;

    // The storage path
    const path = `cowimages/${new Date().getTime()}_${file.name}`;

    // Totally optional metadata
    const customMetadata = { app: 'Aghanya App Image upload' };
    
    //File reference
    const fileRef = this.storage.ref(path);
    var uid_some = Math.floor(Math.random()).toString;
    // The main task
    // this.task = 
    this.updateDB(path,file,customMetadata)
    

    // Get file progress percentage
    // this.percentage = this.task.percentageChanges();
    // this.snapshot = this.task.snapshotChanges().pipe(
      
    //   finalize(() => {
    //     debugger
    //     // Get uploaded file storage path
    //     this.UploadedFileURL = fileRef.getDownloadURL();
        
    //     this.UploadedFileURL.subscribe(resp=>{
    //       this.addImagetoDB({
    //         name: file.name,
    //         filepath: resp,
    //         size: this.fileSize
    //       });
    //       this.isUploading = false;
    //       this.isUploaded = true;
    //     },error=>{
    //       console.error(error);
    //     })
    //   }),
    //   // tap(snap => {
    //   //    // this.fileSize = snap.totalBytes;
    //   // })
    // )

  }
  // function writeUserData(userId, name, email, imageUrl) {
  //   firebase.database().ref('users/' + userId).set({
  //     username: name,
  //     email: email,
  //     profile_picture : imageUrl
  //   });
  // }
  // firebase.database().ref('users/' + userId).set({
  //   //     username: name,
  //   //     email: email,
  //   //     profile_picture : imageUrl
  //   //   });

  addImagetoDB(image: MyData) {
    //Create an ID for document
    const id = this.database.createId();
    
    //Set document id with value in database
    this.imageCollection.doc(id).set(image).then(resp => {
      console.log(resp);
    }).catch(error => {
      console.log("error " + error);
    });
  }


}






  





