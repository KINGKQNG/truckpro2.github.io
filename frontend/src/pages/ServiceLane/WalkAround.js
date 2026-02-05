import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Camera, Mic, Save, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../hooks/use-toast';

const WalkAround = () => {
  const { toast } = useToast();
  const [selectedVehicle, setSelectedVehicle] = useState({
    vin: '1XKAD49X0CJ123457',
    make: 'Peterbilt',
    model: '579',
    year: 2019,
    customer: 'ABC Transport LLC'
  });

  const [inspectionAreas, setInspectionAreas] = useState([
    { id: 'front', name: 'Front End', status: 'pending', photos: [], notes: '', damage: [] },
    { id: 'driver_side', name: 'Driver Side', status: 'pending', photos: [], notes: '', damage: [] },
    { id: 'rear', name: 'Rear End', status: 'pending', photos: [], notes: '', damage: [] },
    { id: 'passenger_side', name: 'Passenger Side', status: 'pending', photos: [], notes: '', damage: [] },
    { id: 'interior', name: 'Interior', status: 'pending', photos: [], notes: '', damage: [] },
    { id: 'under_hood', name: 'Under Hood', status: 'pending', photos: [], notes: '', damage: [] },
    { id: 'tires', name: 'Tires & Wheels', status: 'pending', photos: [], notes: '', damage: [] },
    { id: 'lights', name: 'Lights & Signals', status: 'pending', photos: [], notes: '', damage: [] }
  ]);

  const [damageTypes] = useState([
    'Scratch', 'Dent', 'Rust', 'Crack', 'Missing Part', 'Worn', 'Leak', 'Other'
  ]);

  const handlePhotoCapture = (areaId) => {
    // Simulate photo capture
    setInspectionAreas(prev =>
      prev.map(area =>
        area.id === areaId
          ? { ...area, photos: [...area.photos, `photo_${Date.now()}.jpg`] }
          : area
      )
    );
    
    toast({
      title: "Photo Captured",
      description: "Photo added to inspection area",
    });
  };

  const handleVoiceNote = (areaId) => {
    toast({
      title: "Voice Recording",
      description: "Recording voice note...",
    });
    
    // Simulate voice-to-text
    setTimeout(() => {
      const sampleText = "Minor scratch observed on panel. Recommend touch-up paint.";
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
              status: 'flagged'
            }
          : area
      )
    );
  };

  const completeArea = (areaId) => {
    setInspectionAreas(prev =>
      prev.map(area =>
        area.id === areaId
          ? { ...area, status: area.damage.length > 0 ? 'flagged' : 'completed' }
          : area
      )
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'flagged': return 'bg-red-500';
      case 'pending': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const handleSaveInspection = () => {
    toast({
      title: "Inspection Saved",
      description: "Walk-around inspection has been saved to repair order",
    });
  };

  const handleSendToCustomer = () => {
    toast({
      title: "Sent to Customer",
      description: "Walk-around report sent via text and email",
    });
  };

  const completedCount = inspectionAreas.filter(a => a.status !== 'pending').length;
  const flaggedCount = inspectionAreas.filter(a => a.status === 'flagged').length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Service Lane Walk-Around</h1>
        <p className="text-gray-600 mt-1">Digital tablet-based vehicle inspection</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Vehicle Information</CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
              </p>
              <p className="text-xs text-gray-500">VIN: {selectedVehicle.vin}</p>
              <p className="text-xs text-gray-500">Customer: {selectedVehicle.customer}</p>
            </div>
            <div className="text-right">
              <div className="space-y-2">
                <div>
                  <Badge className="bg-blue-600 text-white">
                    {completedCount}/{inspectionAreas.length} Areas
                  </Badge>
                </div>
                {flaggedCount > 0 && (
                  <div>
                    <Badge className="bg-red-600 text-white">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {flaggedCount} Issues Found
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {inspectionAreas.map((area) => (
          <Card key={area.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{area.name}</CardTitle>
                <Badge className={`${getStatusColor(area.status)} text-white`}>
                  {area.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {area.status === 'flagged' && <AlertCircle className="h-3 w-3 mr-1" />}
                  {area.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {area.damage.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-semibold text-red-800 mb-2">Damage Recorded:</p>
                  {area.damage.map((d, idx) => (
                    <Badge key={idx} variant="outline" className="text-red-600 mr-1 mb-1">
                      {d.type}
                    </Badge>
                  ))}
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">Inspection Notes</label>
                <Textarea
                  value={area.notes}
                  onChange={(e) =>
                    setInspectionAreas(prev =>
                      prev.map(a =>
                        a.id === area.id ? { ...a, notes: e.target.value } : a
                      )
                    )
                  }
                  placeholder="Add notes or use voice-to-text..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePhotoCapture(area.id)}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Photo ({area.photos.length})
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleVoiceNote(area.id)}
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Voice
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Mark Damage</label>
                <div className="flex gap-2 flex-wrap">
                  {damageTypes.map((type) => (
                    <Button
                      key={type}
                      size="sm"
                      variant="outline"
                      onClick={() => addDamage(area.id, type)}
                      className="text-xs"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              {area.status === 'pending' && (
                <Button
                  className="w-full bg-gradient-to-r from-red-600 to-blue-600"
                  onClick={() => completeArea(area.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Area
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4">
        <Button
          size="lg"
          variant="outline"
          onClick={handleSaveInspection}
          className="flex-1"
        >
          <Save className="h-5 w-5 mr-2" />
          Save Inspection
        </Button>
        <Button
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
