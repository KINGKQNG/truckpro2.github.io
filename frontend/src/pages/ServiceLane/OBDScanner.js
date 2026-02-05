import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Scan, AlertTriangle, CheckCircle, Wrench, RefreshCw } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const OBDScanner = () => {
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [scanData, setScanData] = useState(null);

  const handleScan = () => {
    setScanning(true);
    toast({
      title: "Scanning Vehicle",
      description: "Connecting to OBD-II port...",
    });

    // Simulate OBD-II scan
    setTimeout(() => {
      const mockData = {
        vin: '1XKAD49X0CJ123457',
        make: 'Peterbilt',
        model: '579',
        year: 2019,
        mileage: 325478,
        engineHours: 18234,
        oilLife: 35,
        tirePressure: {
          frontLeft: 105,
          frontRight: 108,
          rearLeft: 110,
          rearRight: 107
        },
        dtcs: [
          { code: 'P0420', description: 'Catalyst System Efficiency Below Threshold', severity: 'warning' },
          { code: 'P0171', description: 'System Too Lean (Bank 1)', severity: 'warning' }
        ],
        recalls: [
          { id: 'R2024-001', description: 'Fuel Pump Recall', status: 'open' }
        ],
        batteryVoltage: 12.6,
        coolantTemp: 195,
        fuelLevel: 65,
        timestamp: new Date().toISOString()
      };

      setScanData(mockData);
      setScanning(false);
      
      toast({
        title: "Scan Complete",
        description: "Vehicle data captured successfully",
      });
    }, 3000);
  };

  const createServiceOrder = () => {
    toast({
      title: "Creating Repair Order",
      description: "RO created with OBD-II data and DTC codes",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">eAdvisor OBD-II Scanner</h1>
        <p className="text-gray-600 mt-1">Instant vehicle data capture and diagnostic scanning</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scanner Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
            {!scanning && !scanData && (
              <Button
                size="lg"
                onClick={handleScan}
                className="bg-gradient-to-r from-red-600 to-blue-600"
              >
                <Scan className="h-6 w-6 mr-2" />
                Start OBD-II Scan
              </Button>
            )}
            
            {scanning && (
              <div className="text-center">
                <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-lg font-semibold">Scanning Vehicle...</p>
                <p className="text-sm text-gray-600">Reading OBD-II port data</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {scanData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Mileage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{scanData.mileage.toLocaleString()}</p>
                <p className="text-xs text-gray-500">miles</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Engine Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{scanData.engineHours.toLocaleString()}</p>
                <p className="text-xs text-gray-500">hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Oil Life</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${scanData.oilLife < 20 ? 'text-red-600' : 'text-green-600'}`}>
                  {scanData.oilLife}%
                </p>
                <p className="text-xs text-gray-500">remaining</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Battery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{scanData.batteryVoltage}V</p>
                <p className="text-xs text-gray-500">voltage</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">VIN</p>
                  <p className="font-semibold">{scanData.vin}</p>
                </div>
                <div>
                  <p className="text-gray-600">Year</p>
                  <p className="font-semibold">{scanData.year}</p>
                </div>
                <div>
                  <p className="text-gray-600">Make</p>
                  <p className="font-semibold">{scanData.make}</p>
                </div>
                <div>
                  <p className="text-gray-600">Model</p>
                  <p className="font-semibold">{scanData.model}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tire Pressure Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Front Left</p>
                  <p className="text-2xl font-bold text-green-600">{scanData.tirePressure.frontLeft}</p>
                  <p className="text-xs text-gray-500">PSI</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Front Right</p>
                  <p className="text-2xl font-bold text-green-600">{scanData.tirePressure.frontRight}</p>
                  <p className="text-xs text-gray-500">PSI</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Rear Left</p>
                  <p className="text-2xl font-bold text-green-600">{scanData.tirePressure.rearLeft}</p>
                  <p className="text-xs text-gray-500">PSI</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Rear Right</p>
                  <p className="text-2xl font-bold text-green-600">{scanData.tirePressure.rearRight}</p>
                  <p className="text-xs text-gray-500">PSI</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {scanData.dtcs.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Diagnostic Trouble Codes ({scanData.dtcs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scanData.dtcs.map((dtc, idx) => (
                    <div key={idx} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge className="bg-red-600 text-white mb-2">{dtc.code}</Badge>
                          <p className="font-semibold">{dtc.description}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          <Wrench className="h-4 w-4 mr-2" />
                          Create RO
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {scanData.recalls.length > 0 && (
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                  Open Recalls ({scanData.recalls.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scanData.recalls.map((recall, idx) => (
                    <div key={idx} className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge className="bg-amber-500 text-white mb-2">{recall.id}</Badge>
                          <p className="font-semibold">{recall.description}</p>
                        </div>
                        <Button size="sm" className="bg-amber-600">
                          Schedule Recall
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4">
            <Button
              size="lg"
              onClick={createServiceOrder}
              className="flex-1 bg-gradient-to-r from-red-600 to-blue-600"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Create Repair Order
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleScan}
              className="flex-1"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Scan Again
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default OBDScanner;
