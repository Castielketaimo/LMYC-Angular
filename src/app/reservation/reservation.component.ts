import { Boat } from './../models/boat';
import { FleetService } from './../services/fleet.service';
import { IRoleMember } from './../models/IRoleMember';
import { IReservation } from './../models/reservation'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'

import * as moment from 'moment'
import { CalendarComponent } from 'ng-fullcalendar'
import { Options } from 'fullcalendar'
import { Component, OnInit, ViewChild, Inject, ViewEncapsulation } from '@angular/core'
import { ReservationService } from '../services/reservation.service'
import { Alert } from 'selenium-webdriver'
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})
export class ReservationComponent implements OnInit {
  calendarOptions: Options
  reservations: IReservation[]

  @ViewChild(CalendarComponent) ucCalendar: CalendarComponent

  constructor(protected reservationService: ReservationService,
              public dialog: MatDialog,
              ) { }

  ngOnInit() {

    this.getReservations()
  }

  getReservations(){
    this.reservationService
      .getReservations()
      .subscribe(
        reservations => this.reservations = reservations,
        error => alert("error: " + error),
        () => {
          this.calendarOptions = {
            editable: true,
            eventLimit: false,
            header: {
              left: 'prev,next today',
              center: 'title',
              right: 'month,agendaWeek,agendaDay,listMonth'
            },
            events: this.getReservationsToDisplay()
          }
        }
      )
  }

  //get all the reservations from local array and return an array of booking for display
  getReservationsToDisplay(){
    const dateObj = new Date()
    const yearMonth = dateObj.getUTCFullYear() + '-' + (dateObj.getUTCMonth() + 1)
    let data: any = []

    for(let r of this.reservations){
      data.push({
        BoatName: r.boatName,
        title: r.boatName,
        start: r.startDateTime,
        end: r.endDateTime,
        itinerary: r.itinerary,
        createdBy: r.firstName + r.lastName
      })
    }
    return data
  }

  //display the detail of that event got clicked
  eventClick(model: any) {
    let dialogRef = this.dialog.open(BookingDetailDialogComponent, {
      width: '250px',
      data: { BoatName: model.event.BoatName,
              FromDate: model.event.start.format(),
              EndDate: model.event.start.format(),
              Itinerary: model.event.itinerary,
              CreatedBy: model.event.createdBy,
             }
    })
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed')
    })
  }

  //create a new event when user click on a date
  dayClick(model: any) {
    var date = new Date(model.startDate)
    let dialogRef = this.dialog.open(newBookingDialogComponent, {
      width: '250px',
      data: {
      }
    })
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed')
    })
  }

}

@Component({
  selector: 'app-booking-detail-dialog',
  templateUrl: 'bookingDetailDialog.component.html',
})
export class BookingDetailDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<BookingDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close()
  }
}

@Component({
  selector: 'app-new-booking-dialog',
  templateUrl: 'newBookingDialog.component.html'
})
export class newBookingDialogComponent {
  public dateRange
  public min = new Date()
  public startDateTime
  public endDateTime
  public nonMemberCrews
  public memberCrews
  public memberCrewControl = new FormControl()
  public selectedUsers;
  public Itinerary;
  public allCrewMembers : IRoleMember[];
  selectedBoat
  memberTypes = [];
  newReservation: IReservation
  public allBoats : Boat[]


  constructor(
    public dialogRef: MatDialogRef<newBookingDialogComponent>,
    protected reservationService: ReservationService,
    protected fleetService: FleetService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.getAllMemberCrews()
    this.getAllBoats()
  }

  getAllBoats(): void {
    this.fleetService.getFleets()
      .then(boats => this.allBoats = boats);
  }

  getAllMemberCrews(){
    this.reservationService
      .getMembers()
      .subscribe(
        allCrewMembers => this.allCrewMembers = allCrewMembers,
        error => alert("error: " + error),
        () => {
          this.upDateDropDown()
        }
      )
  }
  afterPickerClosed(){
    if(this.dateRange != null){
      let dateRangeArray = this.dateRange.toString().split(',')
      let startDate = dateRangeArray[0]
      let endDate = dateRangeArray[1]
      if(this.checkDateRangeValid(startDate, endDate)){

      }

    }
  }

  upDateDropDown(){
    let MemberGoodStanding: IRoleMember[] =[];
    let MemberNotGoodStanding: IRoleMember[] =[];
    let AssociateMember: IRoleMember[] =[];
    let BookingModerator: IRoleMember[] = [];
    let Crew: IRoleMember[] = [];
    let DaySkipper: IRoleMember[] = [];
    let CruiseSkipper: IRoleMember[] = [];
    let user = []
    for(let member of this.allCrewMembers){
      let RoleArray = member.role.toString().split(',')
      for(let role of RoleArray){
        if (role === "Member Good Standing") {
          MemberGoodStanding.push(member)
        }
        if (role === "Member Not Good Standing") {
          MemberNotGoodStanding.push(member)
        }
        if (role === "Associate Member") {
          AssociateMember.push(member)
        }
        if (role === "Booking Moderator") {
          BookingModerator.push(member)
        }
        if (role === "Crew") {
          Crew.push(member)
        }
        if (role === "Day Skipper") {
          DaySkipper.push(member)
        }
        if (role === "Cruise Skipper") {
          CruiseSkipper.push(member)
        }
      }
    }

    for (let member of MemberGoodStanding){
      user.push({ value: member.lastName + ' ' + member.firstName + '(' + "Member Good Standing" +')' , viewValue: member.lastName + ' ' + member.firstName})
    }
    this.memberTypes
      .push({
        name: "Member Good Standing",
        user: user
      })
    user.length = 0;

    for (let member of MemberNotGoodStanding) {
      user.push({ value: member.lastName + ' ' + member.firstName + '(' + "Member Not Good Standing" + ')', viewValue: member.lastName + ' ' + member.firstName })
    }
    this.memberTypes
      .push({
        name: "Member Not Good Standing",
        user: user
      })
    user.length = 0;

    for (let member of AssociateMember) {
      user.push({ value: member.lastName + ' ' + member.firstName + '(' + "Associate Member" + ')', viewValue: member.lastName + ' ' + member.firstName })
    }
    this.memberTypes
      .push({
        name: "Associate Member",
        user: user
      })
    user.length = 0;

    for (let member of BookingModerator) {
      user.push({ value: member.lastName + ' ' + member.firstName + '(' + "Booking Moderator" + ')', viewValue: member.lastName + ' ' + member.firstName })
    }
    this.memberTypes
      .push({
        name: "Booking Moderator",
        user: user
      })
    user.length = 0;

    for (let member of Crew) {
      user.push({ value: member.lastName + ' ' + member.firstName + '(' + "Crew" + ')', viewValue: member.lastName + ' ' + member.firstName })
    }
    this.memberTypes
      .push({
        name: "Crew",
        user: user
      })
    user.length = 0;

    for (let member of DaySkipper) {
      user.push({ value: member.lastName + ' ' + member.firstName + '(' + "Day Skipper" + ')', viewValue: member.lastName + ' ' + member.firstName })
    }
    this.memberTypes
      .push({
        name: "Day Skipper",
        user: user
      })
    user.length = 0;

    for (let member of CruiseSkipper) {
      user.push({ value: member.lastName + ' ' + member.firstName + '(' + "Cruise Skipper"+ ')', viewValue: member.lastName + ' ' + member.firstName })
    }
    this.memberTypes
      .push({
        name: "Cruise Skipper",
        user: user
      })

  }

  checkDateRangeValid(startDate, endDate){
    
  }

  formatDate(dateString){
    var date = new Date(dateString)
    var day = date.getDate()
    var monthIndex = date.getMonth()
    var year = date.getFullYear()
    var minutes = '00'
    var hours = date.getHours()
    var seconds = '00'
    var myFormattedDate = day + "-" + (monthIndex + 1) + "-" + year + " " + hours + ":" + minutes + ":" + seconds
    return myFormattedDate
  }

  hourDiff(startDateString, endDateString){
    var startDate = new Date(startDateString)
    var endDate = new Date(endDateString)
    var startTime = startDate.getTime()
    var endTime = endDate.getTime()
    return  ((endTime - startTime) / (1000 * 60 * 60))
  }

  getNewReservation(){

  }
  onSubmit(): void {

    this.dialogRef.close()

  }
}
