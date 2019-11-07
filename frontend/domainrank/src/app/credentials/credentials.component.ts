import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ApiService} from '../services/api.service';
import {first} from 'rxjs/internal/operators';
import {HelperService} from '../services/helper.service';

@Component({
  selector: 'app-credentials',
  templateUrl: './credentials.component.html',
  styleUrls: ['./credentials.component.css']
})
export class CredentialsComponent implements OnInit {

  credentialsForm: FormGroup;
  loading = false;
  submitted = false;

  constructor(private formBuilder: FormBuilder,
              private apiService: ApiService, private helperService: HelperService) {

  }

  ngOnInit() {
    this.credentialsForm = this.formBuilder.group({
      api_key: ['', Validators.required],
      search_engine_id: ['', Validators.required]
    });
    this.apiService.post({}, 'GET_CREDENTIALS')
      .pipe(first())
      .subscribe(
        data => {
          if (data.success === true) {
            const receivedData = JSON.parse(data.data);
            this.credentialsForm.patchValue({
              api_key: receivedData.api_key,
              search_engine_id: receivedData.search_engine_id
            });
          } else {
            this.helperService.showSpecificNotification('success', data.message, '');
          }
        },
        error => {
          this.helperService.showSpecificNotification('error', error, error);
        });
  }

  get f() { return this.credentialsForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.credentialsForm.invalid) {
      return;
    }
    this.loading = true;
    this.apiService.post({api_key: this.f.api_key.value, search_engine_id: this.f.search_engine_id.value},
      'CREATE_CREDENTIALS')
      .pipe(first())
      .subscribe(
        data => {
          this.loading = false;
          if (data.success === true) {
            this.helperService.showSpecificNotification('success', 'Credentials Updated Successfully.', '');
          } else {
            this.helperService.showSpecificNotification('error', data.message, '');
          }
        },
        error => {
          this.loading = false;
          this.helperService.showSpecificNotification('error', error, '');
        });
  }

}
