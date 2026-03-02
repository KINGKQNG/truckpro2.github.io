import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Calendar } from '../../components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Calendar as CalendarIcon, Clock, User, ShoppingCart, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { appointmentsAPI, techniciansAPI } from '../../services/api';

const OnlineScheduler = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [appointmentData, setAppointmentData] = useState({
    email: '',
    phone: '',
    mileage: '',
    services: [],
    time: '',
    advisor: '',
    transportation: '',
    concerns: ''
  });

  const [availableServices] = useState([
    { id: 'oil_change', name: 'Oil Change', price: 89.99, duration: 0.5, category: 'Preventive' },
    { id: 'tire_rotation', name: 'Tire Rotation', price: 49.99, duration: 0.75, category: 'Preventive' },
    { id: 'brake_inspection', name: 'Brake Inspection', price: 0, duration: 0.5, category: 'Inspection' },
    { id: 'pm_service', name: 'Preventive Maintenance', price: 299.99, duration: 2, category: 'Preventive' },
    { id: 'engine_diagnostic', name: 'Engine Diagnostic', price: 149.99, duration: 1, category: 'Diagnostic' },
    { id: 'transmission_service', name: 'Transmission Service', price: 249.99, duration: 1.5, category: 'Service' }
  ]);

  const [timeSlots] = useState([
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
  ]);

  const advisors = useMemo(() => technicians.map((t) => ({
    id: t.id,
    name: t.name,
    image: '👨‍💼',
    rating: (t.efficiency / 20).toFixed(1)
  })), [technicians]);

  useEffect(() => {
    const loadSchedulerData = async () => {
      try {
        const [appointmentsResponse, techniciansResponse] = await Promise.all([
          appointmentsAPI.getAll(),
          techniciansAPI.getAll()
        ]);
        setAppointments(appointmentsResponse.data || []);
        setTechnicians(techniciansResponse.data || []);
      } catch (error) {
        toast({
          title: 'Load failed',
          description: 'Unable to load scheduler data',
          variant: 'destructive'
        });
      }
    };

    loadSchedulerData();
  }, [toast]);

  const getTechWorkload = (techId, selectedDate, selectedTime) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const techAppointments = appointments.filter(apt => 
      apt.technicianId === techId && apt.date === dateStr
    );
    
    const totalHours = techAppointments.reduce((sum, apt) => {
      const service = availableServices.find(s => apt.service.includes(s.name));
      return sum + (service?.duration || 1);
    }, 0);
    
    return {
      hoursBooked: totalHours,
      capacity: 8,
      available: 8 - totalHours,
      isAvailable: totalHours < 8
    };
  };

  const getEstimatedDuration = () => {
    return appointmentData.services.reduce((total, serviceId) => {
      const service = availableServices.find(s => s.id === serviceId);
      return total + (service?.duration || 0);
    }, 0);
  };

  const toggleService = (serviceId) => {
    setAppointmentData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(id => id !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  const getTotalCost = () => {
    return appointmentData.services.reduce((total, serviceId) => {
      const service = availableServices.find(s => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  const handleSubmit = async () => {
    try {
      await appointmentsAPI.create({
        ...appointmentData,
        date: date.toISOString().split('T')[0]
      });
      const refreshed = await appointmentsAPI.getAll();
      setAppointments(refreshed.data || []);
      toast({
        title: "Appointment Booked!",
        description: `Confirmation sent to ${appointmentData.email}. Work order created.`,
      });
      setStep(5);
    } catch (error) {
      toast({
        title: 'Booking failed',
        description: 'Unable to book appointment',
        variant: 'destructive'
      });
    }
  };

  const getAvailableAdvisors = () => {
    return advisors.filter(advisor => {
      const workload = getTechWorkload(advisor.id, date, appointmentData.time);
      const estimatedDuration = getEstimatedDuration();
      return workload.available >= estimatedDuration;
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto" data-testid="online-scheduler-page">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Online Service Scheduler</h1>
        <p className="text-gray-600 mt-1">Book your service appointment - Real-time tech availability</p>
      </div>

      <div className="flex justify-between items-center">
        {[
          { num: 1, label: 'Contact' },
          { num: 2, label: 'Services' },
          { num: 3, label: 'Date & Time' },
          { num: 4, label: 'Review' }
        ].map((s, idx) => (
          <div key={s.num} className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= s.num ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white' : 'bg-gray-300'
            }`}>
              {s.num}
            </div>
            <span className={`ml-2 text-sm font-medium ${step >= s.num ? 'text-blue-600' : 'text-gray-500'}`}>
              {s.label}
            </span>
            {idx < 3 && <div className={`flex-1 h-1 mx-4 ${step > s.num ? 'bg-blue-600' : 'bg-gray-300'}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email Address</Label>
                <Input
                  data-testid="scheduler-email-input"
                  type="email"
                  value={appointmentData.email}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input
                  data-testid="scheduler-phone-input"
                  type="tel"
                  value={appointmentData.phone}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            <div>
              <Label>Current Mileage</Label>
              <Input
                data-testid="scheduler-mileage-input"
                type="number"
                value={appointmentData.mileage}
                onChange={(e) => setAppointmentData(prev => ({ ...prev, mileage: e.target.value }))}
                placeholder="Enter current mileage"
              />
            </div>
            <Button data-testid="scheduler-step1-continue-button" onClick={() => setStep(2)} className="w-full bg-gradient-to-r from-red-600 to-blue-600">
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Select Services</span>
              <Badge className="bg-blue-600 text-white">
                <ShoppingCart className="h-4 w-4 mr-1" />
                {appointmentData.services.length} selected • {getEstimatedDuration()}h
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableServices.map((service) => (
                <div
                  data-testid={`scheduler-service-option-${service.id}`}
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    appointmentData.services.includes(service.id)
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="outline" className="mb-2">{service.category}</Badge>
                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-sm text-gray-600">{service.duration}h</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">
                        ${service.price.toFixed(2)}
                      </p>
                      {appointmentData.services.includes(service.id) && (
                        <CheckCircle className="h-5 w-5 text-blue-600 mt-1" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div>
              <Label>Additional Concerns (Optional)</Label>
              <Textarea
                value={appointmentData.concerns}
                onChange={(e) => setAppointmentData(prev => ({ ...prev, concerns: e.target.value }))}
                placeholder="My truck is making a rattling sound..."
                rows={3}
              />
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-semibold">Estimated Total:</span>
              <span className="text-2xl font-bold text-blue-600">${getTotalCost().toFixed(2)}</span>
            </div>

            <div className="flex gap-2">
              <Button data-testid="scheduler-step2-back-button" onClick={() => setStep(1)} variant="outline" className="flex-1">
                Back
              </Button>
              <Button data-testid="scheduler-step2-continue-button" onClick={() => setStep(3)} className="flex-1 bg-gradient-to-r from-red-600 to-blue-600">
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(selectedDate) => setDate(selectedDate || new Date())}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Select Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => (
                    <Button
                      data-testid={`scheduler-time-slot-${time.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`}
                      key={time}
                      variant={appointmentData.time === time ? 'default' : 'outline'}
                      onClick={() => setAppointmentData(prev => ({ ...prev, time }))}
                      className={appointmentData.time === time ? 'bg-blue-600' : ''}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Select Technician - Live Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {getAvailableAdvisors().map((advisor) => {
                    const workload = getTechWorkload(advisor.id, date, appointmentData.time);
                    return (
                      <div
                        data-testid={`scheduler-advisor-option-${advisor.id}`}
                        key={advisor.id}
                        onClick={() => setAppointmentData(prev => ({ ...prev, advisor: advisor.id }))}
                        className={`p-3 border-2 rounded-lg cursor-pointer flex items-center justify-between ${
                          appointmentData.advisor === advisor.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{advisor.image}</span>
                          <div>
                            <p className="font-semibold">{advisor.name}</p>
                            <p className="text-sm text-gray-600">⭐ {advisor.rating}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={workload.available >= 2 ? 'bg-green-500' : 'bg-amber-500'}>
                                {workload.available.toFixed(1)}h available
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {appointmentData.advisor === advisor.id && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    );
                  })}
                  {getAvailableAdvisors().length === 0 && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-amber-600 mb-2" />
                      <p className="text-sm text-amber-800">No technicians available for selected time. Estimated service time: {getEstimatedDuration()}h</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transportation</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={appointmentData.transportation}
                  onValueChange={(value) => setAppointmentData(prev => ({ ...prev, transportation: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select transportation option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wait">I'll Wait</SelectItem>
                    <SelectItem value="loaner">Need Loaner Vehicle</SelectItem>
                    <SelectItem value="shuttle">Need Shuttle Service</SelectItem>
                    <SelectItem value="pickup">Will Pick Up Later</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button data-testid="scheduler-step3-back-button" onClick={() => setStep(2)} variant="outline" className="flex-1">
                Back
              </Button>
              <Button 
                data-testid="scheduler-step3-review-button"
                onClick={() => setStep(4)} 
                className="flex-1 bg-gradient-to-r from-red-600 to-blue-600"
                disabled={!appointmentData.advisor || !appointmentData.time}
              >
                Review Appointment
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Review Your Appointment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold">{date.toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-semibold">{appointmentData.time}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Technician</p>
                <p className="font-semibold">{advisors.find(a => a.id === appointmentData.advisor)?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-semibold">{getEstimatedDuration()}h</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Selected Services:</p>
              <div className="space-y-2">
                {appointmentData.services.map(serviceId => {
                  const service = availableServices.find(s => s.id === serviceId);
                  return (
                    <div key={serviceId} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span>{service?.name} ({service?.duration}h)</span>
                      <span className="font-semibold">${service?.price.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-lg font-semibold">Total Estimated Cost:</span>
              <span className="text-3xl font-bold text-blue-600">${getTotalCost().toFixed(2)}</span>
            </div>

            <div className="flex gap-2">
              <Button data-testid="scheduler-step4-back-button" onClick={() => setStep(3)} variant="outline" className="flex-1">
                Back
              </Button>
              <Button data-testid="scheduler-confirm-button" onClick={handleSubmit} className="flex-1 bg-gradient-to-r from-red-600 to-blue-600">
                <CheckCircle className="h-5 w-5 mr-2" />
                Confirm Appointment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 5 && (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Appointment Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Confirmation sent to {appointmentData.email}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Work order created • You will receive a reminder 24 hours before
            </p>
            <Button data-testid="scheduler-new-appointment-button" onClick={() => window.location.reload()} className="bg-gradient-to-r from-red-600 to-blue-600">
              Schedule Another Appointment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OnlineScheduler;