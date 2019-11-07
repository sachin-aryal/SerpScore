import { Component, OnInit } from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ApiService} from "../services/api.service";
import {first} from "rxjs/internal/operators";
import {ActivatedRoute, Router} from "@angular/router";
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import {HelperService} from "../services/helper.service";

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class ConfigComponent implements OnInit {

  configForm: FormGroup;
  loading = false;
  submitted = false;
  id: string;
  faPlus = faPlus;
  faTrash = faTrash;

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private apiService: ApiService,
              private router: Router,
              private helperService: HelperService) { }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.configForm = this.formBuilder.group({
      domain: ['', Validators.required],
      keywords: this.formBuilder.array([])
    });
    if(id){
      this.loadConfig(id)
    }else{
      this.addKeyword()
    }
  }

  loadConfig(id){
    const params = {"domain_id": id};
    this.apiService.post(params, "EXTRACT_CONFIG").pipe(first())
      .subscribe(
        data => {
          const success = data.success;
          if(success == true){
            const receivedData = JSON.parse(data.data);
            this.id = id;
            this.configForm.patchValue({
              domain: receivedData.domain
            });
            let keywordsControl = <FormArray>this.configForm.controls.keywords;

            receivedData.configs.forEach(config => {
              keywordsControl.push(this.formBuilder.group(
                {
                  keyword: config.keyword,
                  fetch_interval: config.fetch_interval,
                  status: config.status,
                  config_id: config.id
                }
                )
              )
            })
          }else{
            this.helperService.showSpecificNotification("error", data.message, data.message)
          }
        },
        error => {
          this.helperService.showSpecificNotification("error", error, error)
        });
  }

  initKeywords() {
    return this.formBuilder.group({
      keyword: ['', Validators.required],
      fetch_interval: [1, Validators.required],
      status: [true, Validators.required],
      config_id: [-2, ]
    });
  }

  addKeyword() {
    const control = <FormArray>this.configForm.controls['keywords'];
    control.push(this.initKeywords());
    var container = document.getElementById("config-form-elments");
    container.scrollTop = container.scrollHeight;
  }

  removeKeyword(i: number) {
    const control = <FormArray>this.configForm.controls['keywords'];
    control.removeAt(i);
  }

  get f() { return this.configForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.configForm.invalid) {
      return;
    }
    this.loading = true;
    const params = {"domain": this.f.domain.value, "keywords": this.f.keywords.value};
    if(this.id){
      params["domain_id"] = this.id;
    }
    this.apiService.post(params, "CREATE_CONFIG").pipe(first())
      .subscribe(
        data => {
          const success = data.success;
          if(success == true){
            this.helperService.showSpecificNotification("success", data.message, data.message)
          }else{
            this.helperService.showSpecificNotification("error", data.message, data.message)
          }
        },
        error => {
          this.loading = false;
          this.helperService.showSpecificNotification("error", error, error)
        });
  }

}
