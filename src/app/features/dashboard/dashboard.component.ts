import { Component, inject, OnInit } from '@angular/core';
import { SharedModule } from '@/shared/shared.module';
import { Divider } from 'primeng/divider';
import { ProgressBarModule } from 'primeng/progressbar';
import { RouterLink } from '@angular/router';
import { DashboardService } from '@/core/services/dashboard.service';
import { BaseComponent } from '@/shared/components/base.component';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'app-dashboard',
  imports: [SharedModule, Divider, ProgressBarModule, RouterLink, NgxEchartsDirective],
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent extends BaseComponent implements OnInit {
  service = inject(DashboardService);
  invoice = {
    loading: true,
    dashboardDate: '',
    data: {
      count: 0,
      max: 0
    }
  };
  vehicle = {
    loading: true,
    data: [
      {
        icon: 'icon-car-primary-xl',
        name: 'vehicle.car',
        code: 'CAR',
        value: 0,
        count: 0
      },
      {
        icon: 'icon-motorbike-primary-xl',
        name: 'vehicle.motorbike',
        code: 'MOTORBIKE',
        value: 0,
        count: 0
      },
      {
        icon: 'icon-bike-primary-xl',
        name: 'vehicle.bike',
        code: 'BICYCLE',
        value: 0,
        count: 0
      },
      {
        icon: 'icon-other-primary-xl',
        name: 'vehicle.other',
        code: 'OTHER',
        value: 0,
        count: 0
      }
    ]
  };
  complaintTypeChart = {
    loading: true,
    startDate: '',
    endDate: '',
    total: 0,
    count: 0,
    color: '',
    colorAll: '',
    data: <EChartsOption>{}
  };
  complaintMonthlyChart = {
    data: <EChartsOption>{},
    loading: true,
    color: '',
    startDate: '',
    endDate: ''
  };
  apartmentStatusChart = {
    data: <EChartsOption>{},
    loading: true,
    total: 0
  };
  residentChart = {
    data: <EChartsOption>{},
    loading: true,
    total: 0
  };

  ngOnInit() {
    this.dashboardInvoice();
    this.dashboardVehicle();
    this.dashboardComplaintType();
    this.dashboardComplaintMonthly();
    this.dashboardApartmentStatus();
    this.dashboardResident();
  }

  dashboardInvoice() {
    this.service.getDashboardInvoice().subscribe(result => {
      this.invoice = {
        loading: false,
        data: result.data[0],
        dashboardDate: result.dashboardDate
      };
    });
  }

  dashboardVehicle() {
    this.service.getDashboardVehicle().subscribe(result => {
      this.vehicle.loading = false;
      for (const vehicle of result.data) {
        const item = this.vehicle.data.find(v => v.code === vehicle.code);
        if (item) {
          item.name = vehicle.name;
          item.count = vehicle.count;
          item.value = this.calculatePercentage(vehicle.count, vehicle.max, 2);
        }
      }
    });
  }

  dashboardComplaintType() {
    const data = this.getLast6MonthsRange(new Date());
    this.service.getDashboardComplaintType(data).subscribe(result => {
      this.complaintTypeChart = {
        loading: false,
        startDate: data.startDate,
        endDate: data.endDate,
        total: result.countAll,
        count: result.count,
        colorAll: result.colorAll,
        color: result.color,
        data: {
          tooltip: { trigger: 'axis' },
          grid: {
            left: 65, // 👈 tăng khoảng trống bên trái
            right: 30,
            bottom: 80,
            top: 40
          },
          yAxis: {
            type: 'value',
            name: 'Số lượng'
          },
          xAxis: {
            type: 'category',
            data: result.data.map((item: { name: string }) => item.name),
            axisLabel: {
              formatter: (value: string) => {
                const words = value.split(' ');
                if (words.length > 2) {
                  return words.slice(0, 2).join(' ') + '\n' + words.slice(2).join(' ');
                }
                return value;
              },
              lineHeight: 16,
              interval: 0,
              rotate: 30,
              overflow: 'break',
              margin: 20
              // align: 'left'
            }
          },
          series: [
            {
              name: 'Tổng',
              type: 'bar',
              data: result.data.map((item: { max: number }) => item.max),
              itemStyle: { color: result.colorAll },
              barWidth: 20
            },
            {
              name: 'Đã xử lý',
              type: 'bar',
              data: result.data.map((item: { count: number }) => item.count),
              itemStyle: { color: result.color },
              barWidth: 20
            }
          ]
        }
      };
    });
  }

  dashboardComplaintMonthly() {
    const data = this.getLast6MonthsRange(new Date());
    this.service.getDashboardComplaintMonthly(data).subscribe(result => {
      this.complaintMonthlyChart = {
        loading: false,
        startDate: data.startDate,
        endDate: data.endDate,
        color: result.color,
        data: {
          tooltip: { trigger: 'axis' },
          grid: {
            left: 30, // 👈 tăng khoảng trống bên trái
            right: 10,
            bottom: 40,
            top: 40
          },
          yAxis: {
            type: 'value'
          },
          xAxis: {
            type: 'category',
            data: result.data.map((item: { code: string }) => item.code)
          },
          series: [
            {
              name: 'Số lượng phản ánh',
              type: 'bar',
              data: result.data.map((item: { count: number }) => item.count),
              itemStyle: { color: result.color },
              barWidth: 35
            }
          ]
        }
      };
    });
  }

  private dashboardApartmentStatus() {
    this.service.getDashboardApartmentStatus().subscribe(result => {
      this.apartmentStatusChart = {
        loading: false,
        total: 0,
        data: {
          tooltip: {
            trigger: 'item'
          },
          series: [
            {
              name: 'Trạng thái căn hộ',
              type: 'pie',
              radius: ['55%', '75%'],
              itemStyle: {
                borderRadius: 4,
                borderColor: '#fff',
                borderWidth: 1
              },
              label: {
                show: true
              },
              emphasis: {
                label: {
                  show: true,
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: true
              },
              data: result.data?.map((item: { name: string; count: number; color: string }) => {
                return { value: item.count, name: item.name, itemStyle: { color: item.color } };
              })
            }
          ]
        }
      };
    });
  }

  private dashboardResident() {
    this.service.getDashboardResident().subscribe(result => {
      this.residentChart = {
        loading: false,
        total: 0,
        data: {
          tooltip: {
            trigger: 'item'
          },
          series: [
            {
              name: 'Cư dân',
              type: 'pie',
              radius: ['55%', '75%'],
              itemStyle: {
                borderRadius: 4,
                borderColor: '#fff',
                borderWidth: 1
              },
              label: {
                show: true
              },
              emphasis: {
                label: {
                  show: true,
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: true
              },
              data: result.data?.map((item: { name: string; count: number; color: string }) => {
                return { value: item.count, name: item.name, itemStyle: { color: item.color } };
              })
            }
          ]
        }
      };
    });
  }

  private calculatePercentage(value: number, total: number, decimalPlaces = 1): number {
    if (total === 0) return 0;
    const percent = (value / total) * 100;
    return parseFloat(percent.toFixed(decimalPlaces));
  }

  private getLast6MonthsRange(endDateStr: string | Date): { startDate: string; endDate: string } {
    const endDate = new Date(endDateStr);
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - 5);

    const format = (date: Date) => date.toISOString().slice(0, 10); // YYYY-MM-DD

    return {
      startDate: format(startDate),
      endDate: format(endDate)
    };
  }
}
