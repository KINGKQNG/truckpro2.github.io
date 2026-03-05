import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Camera, Mic, Save, Send, AlertCircle, CheckCircle, Upload, X, PenLine, ThumbsUp, ThumbsDown, MessageSquare, Clock } from 'lucide-react';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { Input } from '../../components/ui/input';
import { inspectionsAPI } from '../../services/api';

// MPI status constants matching CDK Inspect color coding
const MPI_STATUS = {
  GREEN: 'green',    // Good / No Issues
  YELLOW: 'yellow',  // Attention Soon / Monitor
  RED: 'red',        // Needs Immediate Attention
  PENDING: 'pending' // Not Yet Inspected
};

const WalkAround = () => {
  const { toast } = useToast();
  const [selectedVehicle, setSelectedVehicle] = useState({
    vin: '1XKAD49X0CJ123457',
    make: 'Peterbilt',
    model: '579',
    year: 2019,
    mileage: 284512,
    customer: 'ABC Transport LLC',
    phone: '(555) 867-5309',
    advisor: 'Mike Johnson',
    roNumber: 'RO-2025-101',
    promisedTime: '2:00 PM'
  });

  const [inspectionAreas, setInspectionAreas] = useState([
    { id: 'engine', name: 'Engine / Fluids', status: MPI_STATUS.PENDING, photos: [], notes: '', damage: [], recommendedService: 'Engine Oil & Filter Change', price: 189.99 },
    { id: 'brakes', name: 'Brakes & Wheel Ends', status: MPI_STATUS.PENDING, photos: [], notes: '', damage: [], recommendedService: 'Brake Inspection & Adjustment', price: 129.99 },
    { id: 'tires', name: 'Tires & Wheels', status: MPI_STATUS.PENDING, photos: [], notes: '', damage: [], recommendedService: 'Tire Rotation & Balance', price: 149.99 },
    { id: 'steering', name: 'Steering & Suspension', status: MPI_STATUS.PENDING, photos: [], notes: '', damage: [], recommendedService: 'Alignment Check', price: 99.99 },
    { id: 'lights', name: 'Lights & Signals', status: MPI_STATUS.PENDING, photos: [], notes: '', damage: [], recommendedService: 'Bulb Replacement', price: 49.99 },
    { id: 'exhaust', name: 'Exhaust & Emissions', status: MPI_STATUS.PENDING, photos: [], notes: '', damage: [], recommendedService: 'DPF Cleaning', price: 349.99 },
    { id: 'cab_interior', name: 'Cab & Interior', status: MPI_STATUS.PENDING, photos: [], notes: '', damage: [], recommendedService: 'Cabin Air Filter Replacement', price: 59.99 },
    { id: 'fifth_wheel', name: '5th Wheel & Coupling', status: MPI_STATUS.PENDING, photos: [], notes: '', damage: [], recommendedService: '5th Wheel Lubrication & Inspection', price: 89.99 },
    { id: 'air_system', name: 'Air System / Brakes', status: MPI_STATUS.PENDING, photos: [], notes: '', damage: [], recommendedService: 'Air Dryer Service', price: 199.99 },
    { id: 'frame_body', name: 'Frame & Body', status: MPI_STATUS.PENDING, photos: [], notes: '', damage: [], recommendedService: 'Frame Inspection', price: 79.99 }
  ]);

  const [recommendedServices, setRecommendedServices] = useState([]);
  const [declinedServices, setDeclinedServices] = useState([]);
  const [customerApprovalSent, setCustomerApprovalSent] = useState(false);
  const [eSignature, setESignature] = useState('');
  const [signatureMode, setSignatureMode] = useState(false);

  const [damageTypes] = useState([
    'Scratch', 'Dent', 'Rust', 'Crack', 'Missing Part', 'Worn', 'Leak', 'Other'
  ]);

  const handlePhotoUpload = async (areaId, event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      try {
        const filesArray = Array.from(files);
        const uploadResponse = await inspectionsAPI.uploadMedia(areaId, filesArray);
        const newPhotos = uploadResponse.data.files.map((file, index) => ({
          name: file.name,
          size: file.size,
          url: URL.createObjectURL(filesArray[index]),
          timestamp: file.timestamp
        }));

        setInspectionAreas(prev =>
          prev.map(area =>
            area.id === areaId
              ? { ...area, photos: [...area.photos, ...newPhotos] }
              : area
          )
        );

        toast({
          title: "Photos Uploaded",
          description: `${newPhotos.length} media file(s) added to ${inspectionAreas.find(a => a.id === areaId)?.name}`,
        });
      } catch (error) {
        toast({
          title: 'Upload failed',
          description: 'Unable to upload media files',
          variant: 'destructive'
        });
      }
    }
  };

  const handleRemovePhoto = (areaId, photoIndex) => {
    setInspectionAreas(prev =>
      prev.map(area =>
        area.id === areaId
          ? { ...area, photos: area.photos.filter((_, idx) => idx !== photoIndex) }
          : area
      )
    );
  };

  const handleVoiceNote = (areaId) => {
    toast({
      title: "Voice Recording",
      description: "Recording voice note...",
    });

    const areaVoiceNotes = {
      engine:      "Engine oil is dark and overdue for change. Coolant level low — recommend top-off.",
      brakes:      "Front brake pads at 30% remaining. Rear drums within spec. Recommend front pad replacement.",
      tires:       "Driver steer tire showing uneven wear on inside edge. Rotate or replace recommended.",
      steering:    "Slight play in steering gear. Alignment pull to the left observed during test drive.",
      lights:      "Left marker light out. All other lights functional. Recommend bulb replacement.",
      exhaust:     "DPF soot level at 85%. DPF cleaning recommended. No visible exhaust leaks.",
      cab_interior:"Cabin air filter clogged with debris. A/C performance reduced. Replace recommended.",
      fifth_wheel: "5th wheel locking mechanism functioning. Plate shows normal wear — lubrication applied.",
      air_system:  "Air dryer purging normally. System builds to 120 PSI within spec.",
      frame_body:  "Frame rail shows surface rust on driver side. No cracks or structural issues found."
    };
    const sampleText = areaVoiceNotes[areaId] || "Minor wear observed. Recommend service at next interval.";

    setTimeout(() => {
      setInspectionAreas(prev =>
        prev.map(area =>
          area.id === areaId
            ? { ...area, notes: area.notes + (area.notes ? ' ' : '') + sampleText }
            : area
        )
      );
      
      toast({
        title: "Voice Note Added",
        description: "Voice converted to text",
      });
    }, 1500);
  };

  const addDamage = (areaId, damageType) => {
    setInspectionAreas(prev =>
      prev.map(area =>
        area.id === areaId
          ? { 
              ...area, 
              damage: [...area.damage, { type: damageType, timestamp: new Date().toISOString() }],
              status: MPI_STATUS.RED
            }
          : area
      )
    );
  };

  // CDK-style MPI status setter: green / yellow / red
  const setMPIStatus = (areaId, status) => {
    setInspectionAreas(prev =>
      prev.map(area => {
        if (area.id !== areaId) return area;
        const updated = { ...area, status };
        // Auto-add to recommended services if RED or YELLOW
        if (status === MPI_STATUS.RED || status === MPI_STATUS.YELLOW) {
          setRecommendedServices(svc => {
            if (!svc.find(s => s.areaId === areaId)) {
              return [...svc, {
                areaId,
                areaName: area.name,
                service: area.recommendedService,
                price: area.price,
                urgency: status,
                customerDecision: null
              }];
            }
            return svc.map(s => s.areaId === areaId ? { ...s, urgency: status } : s);
          });
        } else if (status === MPI_STATUS.GREEN) {
          setRecommendedServices(svc => svc.filter(s => s.areaId !== areaId));
        }
        return updated;
      })
    );
  };

  const handleServiceDecision = (areaId, decision) => {
    setRecommendedServices(prev =>
      prev.map(s => s.areaId === areaId ? { ...s, customerDecision: decision } : s)
    );
    if (decision === 'declined') {
      const svc = recommendedServices.find(s => s.areaId === areaId);
      if (svc) setDeclinedServices(prev => [...prev.filter(d => d.areaId !== areaId), svc]);
    } else {
      setDeclinedServices(prev => prev.filter(d => d.areaId !== areaId));
    }
  };

  const handleSendApprovalRequest = () => {
    setCustomerApprovalSent(true);
    toast({
      title: "Approval Request Sent",
      description: `MPI results sent to ${selectedVehicle.customer} via text & email. Customer can approve or decline each service.`,
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case MPI_STATUS.GREEN:  return { badge: 'bg-green-600', border: 'border-l-green-500', bg: 'bg-green-50', label: 'Good' };
      case MPI_STATUS.YELLOW: return { badge: 'bg-amber-500', border: 'border-l-amber-400', bg: 'bg-amber-50', label: 'Attention Soon' };
      case MPI_STATUS.RED:    return { badge: 'bg-red-600',   border: 'border-l-red-500',   bg: 'bg-red-50',   label: 'Needs Attention' };
      default:                return { badge: 'bg-gray-400',  border: 'border-l-gray-300',  bg: 'bg-white',    label: 'Not Inspected' };
    }
  };

  // Helper: returns Tailwind classes for a traffic-light MPI button
  const getMPIButtonClass = (buttonStatus, currentStatus) =>
    buttonStatus === currentStatus
      ? {
          [MPI_STATUS.GREEN]:  'bg-green-600 hover:bg-green-700 text-white',
          [MPI_STATUS.YELLOW]: 'bg-amber-500 hover:bg-amber-600 text-white',
          [MPI_STATUS.RED]:    'bg-red-600 hover:bg-red-700 text-white',
        }[buttonStatus]
      : {
          [MPI_STATUS.GREEN]:  'bg-gray-200 text-gray-700 hover:bg-green-100',
          [MPI_STATUS.YELLOW]: 'bg-gray-200 text-gray-700 hover:bg-amber-100',
          [MPI_STATUS.RED]:    'bg-gray-200 text-gray-700 hover:bg-red-100',
        }[buttonStatus];

  const handleSaveInspection = async () => {
    try {
      await inspectionsAPI.save({
        vehicle: selectedVehicle,
        areas: inspectionAreas,
        recommendedServices,
        declinedServices
      });
      toast({
        title: "Inspection Saved",
        description: "MPI saved to repair order " + selectedVehicle.roNumber,
      });
    } catch (error) {
      toast({
        title: 'Save failed',
        description: 'Unable to save inspection',
        variant: 'destructive'
      });
    }
  };

  const handleSendToCustomer = () => {
    handleSendApprovalRequest();
  };

  const inspectedCount = inspectionAreas.filter(a => a.status !== MPI_STATUS.PENDING).length;
  const redCount   = inspectionAreas.filter(a => a.status === MPI_STATUS.RED).length;
  const yellowCount = inspectionAreas.filter(a => a.status === MPI_STATUS.YELLOW).length;
  const greenCount  = inspectionAreas.filter(a => a.status === MPI_STATUS.GREEN).length;
  const approvedTotal = recommendedServices
    .filter(s => s.customerDecision === 'approved')
    .reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="p-6 space-y-6" data-testid="walk-around-page">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Multi-Point Inspection (MPI)</h1>
          <p className="text-gray-600 mt-1">eAdvisor — Digital tablet-based vehicle inspection</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          Promised: <span className="font-semibold text-gray-900">{selectedVehicle.promisedTime}</span>
        </div>
      </div>

      {/* Vehicle & RO Header — matches CDK eAdvisor check-in card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                RO #{selectedVehicle.roNumber}
                <Badge className="bg-blue-600 text-white text-xs">In Service</Badge>
              </CardTitle>
              <p className="text-base font-semibold text-gray-800 mt-1">
                {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
              </p>
              <p className="text-sm text-gray-500">VIN: {selectedVehicle.vin}</p>
              <p className="text-sm text-gray-500">Mileage: {selectedVehicle.mileage.toLocaleString()} mi</p>
            </div>
            <div className="text-right space-y-1">
              <p className="font-semibold text-gray-900">{selectedVehicle.customer}</p>
              <p className="text-sm text-gray-500">{selectedVehicle.phone}</p>
              <p className="text-sm text-gray-500">Advisor: {selectedVehicle.advisor}</p>
            </div>
          </div>
        </CardHeader>
        {/* MPI summary bar — CDK Inspect style */}
        <CardContent className="pt-0">
          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm">
              <span className="font-medium text-gray-700">{inspectedCount}/{inspectionAreas.length} Inspected</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 rounded-full text-sm">
              <span className="w-3 h-3 rounded-full bg-red-600 inline-block" />
              <span className="font-medium text-red-800">{redCount} Needs Attention</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 rounded-full text-sm">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="font-medium text-amber-800">{yellowCount} Attention Soon</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full text-sm">
              <span className="w-3 h-3 rounded-full bg-green-600 inline-block" />
              <span className="font-medium text-green-800">{greenCount} Good</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MPI Inspection Grid — CDK red/yellow/green color coding */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {inspectionAreas.map((area) => {
          const style = getStatusStyle(area.status);
          return (
            <Card key={area.id} className={`hover:shadow-lg transition-shadow border-l-4 ${style.border}`}>
              <CardHeader className={`${style.bg} rounded-t-lg`}>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">{area.name}</CardTitle>
                  <Badge className={`${style.badge} text-white text-xs`}>
                    {area.status === MPI_STATUS.GREEN  && <CheckCircle className="h-3 w-3 mr-1" />}
                    {area.status === MPI_STATUS.RED    && <AlertCircle className="h-3 w-3 mr-1" />}
                    {style.label}
                  </Badge>
                </div>
                {/* CDK-style traffic light buttons */}
                <div className="flex gap-2 mt-2">
                  <Button
                    data-testid={`walk-around-status-green-${area.id}`}
                    size="sm"
                    onClick={() => setMPIStatus(area.id, MPI_STATUS.GREEN)}
                    className={`flex-1 text-xs ${getMPIButtonClass(MPI_STATUS.GREEN, area.status)}`}
                  >
                    ✓ Good
                  </Button>
                  <Button
                    data-testid={`walk-around-status-yellow-${area.id}`}
                    size="sm"
                    onClick={() => setMPIStatus(area.id, MPI_STATUS.YELLOW)}
                    className={`flex-1 text-xs ${getMPIButtonClass(MPI_STATUS.YELLOW, area.status)}`}
                  >
                    ⚠ Soon
                  </Button>
                  <Button
                    data-testid={`walk-around-status-red-${area.id}`}
                    size="sm"
                    onClick={() => setMPIStatus(area.id, MPI_STATUS.RED)}
                    className={`flex-1 text-xs ${getMPIButtonClass(MPI_STATUS.RED, area.status)}`}
                  >
                    ✗ Urgent
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-3">
                {area.damage.length > 0 && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs font-semibold text-red-800 mb-1">Damage Recorded:</p>
                    {area.damage.map((d, idx) => (
                      <Badge key={idx} variant="outline" className="text-red-600 mr-1 mb-1 text-xs">
                        {d.type}
                      </Badge>
                    ))}
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-1 block">Tech Notes</label>
                  <Textarea
                    value={area.notes}
                    onChange={(e) =>
                      setInspectionAreas(prev =>
                        prev.map(a =>
                          a.id === area.id ? { ...a, notes: e.target.value } : a
                        )
                      )
                    }
                    placeholder="Add technician notes..."
                    rows={2}
                    className="text-sm"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <div>
                    <Input
                      data-testid={`walk-around-upload-input-${area.id}`}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      id={`upload-${area.id}`}
                      onChange={(e) => handlePhotoUpload(area.id, e)}
                    />
                    <Button
                      data-testid={`walk-around-upload-button-${area.id}`}
                      size="sm"
                      variant="outline"
                      type="button"
                      onClick={() => document.getElementById(`upload-${area.id}`).click()}
                      className="text-xs"
                    >
                      <Camera className="h-3 w-3 mr-1" />
                      Photo/Video ({area.photos.length})
                    </Button>
                  </div>
                  <Button
                    data-testid={`walk-around-voice-button-${area.id}`}
                    size="sm"
                    variant="outline"
                    onClick={() => handleVoiceNote(area.id)}
                    className="text-xs"
                  >
                    <Mic className="h-3 w-3 mr-1" />
                    Voice
                  </Button>
                </div>

                {area.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {area.photos.map((photo, idx) => (
                      <div key={idx} className="relative group">
                        <img 
                          src={photo.url} 
                          alt={`${area.name} ${idx + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                        <Button
                          data-testid={`walk-around-remove-media-${area.id}-${idx}`}
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                          onClick={() => handleRemovePhoto(area.id, idx)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium mb-1 block text-gray-500">Mark Damage</label>
                  <div className="flex gap-1 flex-wrap">
                    {damageTypes.map((type) => (
                      <Button
                        data-testid={`walk-around-damage-button-${area.id}-${type.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                        key={type}
                        size="sm"
                        variant="outline"
                        onClick={() => addDamage(area.id, type)}
                        className="text-xs h-6 px-2"
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Show recommended service if flagged — CDK-style upsell */}
                {(area.status === MPI_STATUS.RED || area.status === MPI_STATUS.YELLOW) && (
                  <div className={`p-2 rounded-lg border text-xs ${area.status === MPI_STATUS.RED ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                    <p className="font-semibold mb-0.5">Recommended: {area.recommendedService}</p>
                    <p className="text-gray-600">${area.price.toFixed(2)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recommended Services with Customer Approval — CDK/eleads style */}
      {recommendedServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Recommended Services — Customer Approval
              {customerApprovalSent && (
                <Badge className="bg-green-600 text-white text-xs">Sent to Customer</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendedServices.map((svc) => (
                <div
                  key={svc.areaId}
                  className={`p-3 rounded-lg border flex items-center justify-between gap-4 ${
                    svc.urgency === MPI_STATUS.RED ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${svc.urgency === MPI_STATUS.RED ? 'bg-red-600' : 'bg-amber-500'}`} />
                      <p className="font-semibold text-sm">{svc.service}</p>
                    </div>
                    <p className="text-xs text-gray-500 ml-4">{svc.areaName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">${svc.price.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      data-testid={`walk-around-approve-service-${svc.areaId}`}
                      size="sm"
                      onClick={() => handleServiceDecision(svc.areaId, 'approved')}
                      className={`text-xs ${svc.customerDecision === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-200 text-gray-700 hover:bg-green-100'}`}
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                    <Button
                      data-testid={`walk-around-decline-service-${svc.areaId}`}
                      size="sm"
                      variant="outline"
                      onClick={() => handleServiceDecision(svc.areaId, 'declined')}
                      className={`text-xs ${svc.customerDecision === 'declined' ? 'border-red-500 text-red-600' : ''}`}
                    >
                      <ThumbsDown className="h-3 w-3 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Approval summary */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  {recommendedServices.filter(s => s.customerDecision === 'approved').length} of {recommendedServices.length} services approved
                </p>
                {declinedServices.length > 0 && (
                  <p className="text-xs text-gray-600 mt-0.5">{declinedServices.length} declined — will be logged for follow-up</p>
                )}
              </div>
              <p className="text-lg font-bold text-blue-700">${approvedTotal.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Declined Services — eleads follow-up tracking */}
      {declinedServices.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-700 text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Declined Services — Follow-Up Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {declinedServices.map((svc) => (
                <div key={svc.areaId} className="flex justify-between items-center p-2 bg-orange-50 border border-orange-200 rounded text-sm">
                  <span className="font-medium">{svc.service}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600">${svc.price.toFixed(2)}</span>
                    <Badge variant="outline" className="text-orange-600 border-orange-400 text-xs">Declined</Badge>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">These will auto-populate in the CRM follow-up queue for future outreach.</p>
          </CardContent>
        </Card>
      )}

      {/* eSignature — CDK/eleads customer sign-off */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PenLine className="h-4 w-4" />
            Customer eSignature
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!signatureMode ? (
            <Button
              data-testid="walk-around-esignature-button"
              variant="outline"
              onClick={() => setSignatureMode(true)}
              className="w-full border-dashed border-2 h-16 text-gray-500"
            >
              <PenLine className="h-4 w-4 mr-2" />
              Tap to Sign — Customer Authorizes Approved Services
            </Button>
          ) : (
            <div className="space-y-2">
              <Input
                data-testid="walk-around-esignature-input"
                placeholder="Customer full name (type to sign)"
                value={eSignature}
                onChange={(e) => setESignature(e.target.value)}
                className="border-blue-400"
              />
              <Button
                data-testid="walk-around-esignature-confirm-button"
                onClick={() => {
                  setSignatureMode(false);
                  toast({ title: 'eSignature Captured', description: `${eSignature} authorized approved services.` });
                }}
                className="w-full bg-gradient-to-r from-red-600 to-blue-600"
                disabled={!eSignature.trim()}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Signature
              </Button>
            </div>
          )}
          {!signatureMode && eSignature && (
            <p className="text-sm text-green-700 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Signed: <em className="font-medium ml-1">{eSignature}</em>
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          data-testid="walk-around-save-button"
          size="lg"
          variant="outline"
          onClick={handleSaveInspection}
          className="flex-1"
        >
          <Save className="h-5 w-5 mr-2" />
          Save to RO
        </Button>
        <Button
          data-testid="walk-around-send-customer-button"
          size="lg"
          onClick={handleSendToCustomer}
          className="flex-1 bg-gradient-to-r from-red-600 to-blue-600"
        >
          <Send className="h-5 w-5 mr-2" />
          Send to Customer
        </Button>
      </div>
    </div>
  );
};

export default WalkAround;
