import { BoatStatus } from './../models/boat';
import { Injectable } from '@angular/core';
import { Boat } from '../models/boat';
import { of } from 'rxjs/observable/of';
import { Headers, Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

@Injectable()
export class FleetService {

  constructor(
    private http: Http,) { }
  private BASE_URL = "https://localhost:44382/api/boats"; 
  getFleets(): Promise<Boat[]> {
      return this.http.get(this.BASE_URL)
        .toPromise()
        .then(response => response.json() as Boat[])
        .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
