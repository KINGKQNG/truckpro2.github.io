import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Search, AlertTriangle, CheckCircle, Wrench, RefreshCw, Zap, FileText,
  Book, Settings, Activity, ChevronDown, ChevronUp, Cpu, Package, Cable,
  ClipboardList, Scan
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { dieselLaptopsAPI } from '../services/api';

const MAKES = ['Freightliner', 'Peterbilt', 'Kenworth', 'Volvo', 'Mack', 'International', 'Western Star'];
const WIRING_SYSTEMS = ['Engine', 'Brakes', 'Electrical', 'Transmission', 'HVAC'];
const TABS = [
  { id: 'dtc', label: 'DTC Lookup', icon: Zap },
  { id: 'parts', label: 'Parts Search', icon: Package },
  { id: 'wiring', label: 'Wiring Diagrams', icon: Cable },
  { id: 'tsb', label: 'Service Bulletins', icon: FileText },
  { id: 'maintenance', label: 'Maintenance', icon: ClipboardList },
  { id: 'fleet', label: 'Fleet Scanner', icon: Scan },
];

const SeverityBadge = ({ severity }) => {
  const colors = {
    critical: 'bg-red-600 text-white',
    high: 'bg-orange-500 text-white',
    medium: 'bg-yellow-500 text-white',
    low: 'bg-blue-500 text-white',
  };
  return (
    <Badge className={colors[severity] || 'bg-gray-500 text-white'}>
      {(severity || 'unknown').toUpperCase()}
    </Badge>
  );
};

const AvailabilityBadge = ({ availability }) => {
  const map = {
    in_stock: { label: 'In Stock', cls: 'bg-green-500 text-white' },
    limited: { label: 'Limited', cls: 'bg-yellow-500 text-white' },
    order: { label: 'Order Required', cls: 'bg-orange-500 text-white' },
  };
  const info = map[availability] || { label: availability, cls: 'bg-gray-500 text-white' };
  return <Badge className={info.cls}>{info.label}</Badge>;
};

// ─── DTC Lookup Tab ───────────────────────────────────────────────────────────
const DTCTab = () => {
  const { toast } = useToast();
  const [code, setCode] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [expanded, setExpanded] = useState({});

  const toggle = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const handleLookup = async () => {
    if (!code.trim()) {
      toast({ title: 'Code Required', description: 'Enter a DTC or SPN/FMI code', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await dieselLaptopsAPI.lookupDTC(code.trim(), make || undefined, model || undefined);
      setResult(res.data);
      setExpanded({});
    } catch {
      toast({ title: 'Lookup failed', description: 'Unable to retrieve DTC data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="dtc-tab">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Fault Code Lookup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label>DTC / SPN Code</Label>
              <Input
                data-testid="dtc-code-input"
                placeholder="e.g. P0087, SPN102FMI2"
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLookup()}
              />
            </div>
            <div>
              <Label>Make (optional)</Label>
              <Select value={make} onValueChange={setMake}>
                <SelectTrigger><SelectValue placeholder="All Makes" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Makes</SelectItem>
                  {MAKES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Model (optional)</Label>
              <Input
                placeholder="e.g. T680, Cascadia"
                value={model}
                onChange={e => setModel(e.target.value)}
              />
            </div>
          </div>
          <Button
            data-testid="dtc-lookup-button"
            className="mt-4 bg-gradient-to-r from-red-600 to-blue-600"
            onClick={handleLookup}
            disabled={loading}
          >
            {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
            Look Up Code
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card data-testid="dtc-result">
          <CardHeader>
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-2xl">{result.code}</CardTitle>
                <p className="text-gray-700 mt-1 font-medium">{result.description}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <SeverityBadge severity={result.severity} />
                {result.system && <Badge variant="outline">{result.system}</Badge>}
                {result.laborTime && <Badge variant="outline"><Wrench className="h-3 w-3 mr-1" />{result.laborTime} hrs</Badge>}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Possible Causes */}
            {result.possibleCauses?.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-3 bg-orange-50 hover:bg-orange-100 text-left font-semibold text-orange-800"
                  onClick={() => toggle('causes')}
                >
                  <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Possible Causes ({result.possibleCauses.length})</span>
                  {expanded.causes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {expanded.causes && (
                  <ul className="p-3 space-y-1">
                    {result.possibleCauses.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-orange-500 mt-0.5">•</span>{c}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Recommended Actions */}
            {result.recommendedActions?.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 text-left font-semibold text-blue-800"
                  onClick={() => toggle('actions')}
                >
                  <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" />Recommended Actions ({result.recommendedActions.length})</span>
                  {expanded.actions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {expanded.actions && (
                  <ul className="p-3 space-y-1">
                    {result.recommendedActions.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>{a}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Repair Procedures */}
            {result.repairProcedures?.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 text-left font-semibold text-green-800"
                  onClick={() => toggle('procedures')}
                >
                  <span className="flex items-center gap-2"><Wrench className="h-4 w-4" />Repair Procedures ({result.repairProcedures.length} steps)</span>
                  {expanded.procedures ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {expanded.procedures && (
                  <div className="p-3 space-y-3">
                    {result.repairProcedures.map((step) => (
                      <div key={step.step} className="flex gap-3 text-sm">
                        <span className="w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{step.step}</span>
                        <p>{step.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Related Codes */}
              {result.relatedCodes?.length > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-sm mb-2">Related Fault Codes</p>
                  <div className="flex flex-wrap gap-1">
                    {result.relatedCodes.map(c => (
                      <button key={c} className="text-xs px-2 py-1 bg-white border rounded hover:bg-blue-50 hover:border-blue-300" onClick={() => { setCode(c); setResult(null); }}>{c}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Common Parts */}
              {result.commonParts?.length > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-sm mb-2">Commonly Replaced Parts</p>
                  <div className="space-y-1">
                    {result.commonParts.map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="font-mono text-blue-700">{p.partNumber}</span>
                        <span className="text-gray-600">{p.description}</span>
                        <span className="font-semibold text-green-700">${p.price?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick reference codes */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Quick Reference – Common Truck Codes</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {['P0087', 'P0299', 'P0420', 'SPN102FMI2', 'SPN27FMI5', 'SPN100FMI1'].map(c => (
              <button key={c} className="text-xs px-3 py-2 bg-gray-100 border rounded hover:bg-blue-50 hover:border-blue-300 font-mono text-left" onClick={() => { setCode(c); setResult(null); }}>{c}</button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ─── Parts Search Tab ─────────────────────────────────────────────────────────
const PartsTab = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [make, setMake] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({ title: 'Search term required', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await dieselLaptopsAPI.searchParts(query.trim(), make || undefined);
      setResults(res.data.results || []);
    } catch {
      toast({ title: 'Search failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="parts-tab">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-500" />
            Parts Lookup & Cross-Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label>Part Number or Keyword</Label>
              <Input
                data-testid="parts-search-input"
                placeholder="e.g. turbocharger, A0090960399, EGR valve"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div>
              <Label>Make (optional)</Label>
              <Select value={make} onValueChange={setMake}>
                <SelectTrigger><SelectValue placeholder="All Makes" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Makes</SelectItem>
                  {MAKES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            data-testid="parts-search-button"
            className="mt-4 bg-gradient-to-r from-red-600 to-blue-600"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
            Search Parts
          </Button>
        </CardContent>
      </Card>

      {results !== null && (
        <div>
          <p className="text-sm text-gray-500 mb-3">{results.length} result(s) found</p>
          <div className="space-y-4">
            {results.map((part, idx) => (
              <Card key={idx} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono font-bold text-blue-700">{part.partNumber}</span>
                        <Badge variant="outline">{part.category}</Badge>
                      </div>
                      <p className="font-semibold">{part.name}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{part.description}</p>
                      {part.oemNumbers?.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          <span className="text-xs text-gray-400">OEM:</span>
                          {part.oemNumbers.map(n => <span key={n} className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">{n}</span>)}
                        </div>
                      )}
                      {part.make?.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          <span className="text-xs text-gray-400">Fits:</span>
                          {part.make.map(m => <span key={m} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{m}</span>)}
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-bold text-green-700">${part.price?.toFixed(2)}</p>
                      <AvailabilityBadge availability={part.availability} />
                      {part.specifications && Object.keys(part.specifications).length > 0 && (
                        <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                          {Object.entries(part.specifications).slice(0, 3).map(([k, v]) => (
                            <div key={k}><span className="font-medium capitalize">{k}:</span> {String(v)}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-sm">Popular Search Terms</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['turbocharger', 'EGR valve', 'fuel filter', 'injector', 'DPF', 'wheel seal', 'coolant pump'].map(t => (
              <button key={t} className="text-xs px-3 py-1.5 bg-gray-100 border rounded hover:bg-blue-50 hover:border-blue-300" onClick={() => { setQuery(t); setResults(null); }}>{t}</button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ─── Wiring Diagrams Tab ──────────────────────────────────────────────────────
const WiringTab = () => {
  const { toast } = useToast();
  const [vin, setVin] = useState('');
  const [system, setSystem] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleLookup = async () => {
    if (!vin.trim() || !system) {
      toast({ title: 'VIN and system required', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await dieselLaptopsAPI.getWiringDiagram(vin.trim(), system);
      setResult(res.data);
    } catch {
      toast({ title: 'Lookup failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="wiring-tab">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cable className="h-5 w-5 text-purple-500" />
            Wiring Diagrams & Pin-Out Charts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label>Vehicle VIN</Label>
              <Input
                data-testid="wiring-vin-input"
                placeholder="Enter 17-character VIN"
                value={vin}
                onChange={e => setVin(e.target.value)}
                maxLength={17}
              />
            </div>
            <div>
              <Label>System</Label>
              <Select value={system} onValueChange={setSystem}>
                <SelectTrigger data-testid="wiring-system-select"><SelectValue placeholder="Select system" /></SelectTrigger>
                <SelectContent>
                  {WIRING_SYSTEMS.map(s => <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            data-testid="wiring-lookup-button"
            className="mt-4 bg-gradient-to-r from-red-600 to-blue-600"
            onClick={handleLookup}
            disabled={loading}
          >
            {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Cable className="h-4 w-4 mr-2" />}
            Load Wiring Diagram
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{result.system}</CardTitle>
              <p className="text-sm text-gray-500">VIN: {result.vin}</p>
            </CardHeader>
            <CardContent>
              <h4 className="font-semibold mb-3 text-sm uppercase text-gray-500 tracking-wide">Circuit List</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-2 border">Circuit</th>
                      <th className="text-left p-2 border">Wire Color</th>
                      <th className="text-left p-2 border">Gauge</th>
                      <th className="text-left p-2 border">Connector</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.circuits?.map((c, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="p-2 border font-medium">{c.circuit}</td>
                        <td className="p-2 border">
                          <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
                              style={{ backgroundColor: c.wireColor.split('/')[0].toLowerCase() === 'red' ? '#ef4444'
                                : c.wireColor.split('/')[0].toLowerCase() === 'black' ? '#1f2937'
                                : c.wireColor.split('/')[0].toLowerCase() === 'yellow' ? '#eab308'
                                : c.wireColor.split('/')[0].toLowerCase() === 'green' ? '#22c55e'
                                : c.wireColor.split('/')[0].toLowerCase() === 'orange' ? '#f97316'
                                : c.wireColor.split('/')[0].toLowerCase() === 'blue' ? '#3b82f6'
                                : c.wireColor.split('/')[0].toLowerCase() === 'brown' ? '#92400e'
                                : c.wireColor.split('/')[0].toLowerCase() === 'purple' ? '#a855f7'
                                : '#d1d5db' }} />
                            {c.wireColor}
                          </span>
                        </td>
                        <td className="p-2 border">{c.gauge}</td>
                        <td className="p-2 border">{c.connectorType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {result.pinLayouts?.length > 0 && result.pinLayouts.map((layout, li) => (
            <Card key={li}>
              <CardHeader><CardTitle className="text-base">{layout.connector} – Pin Layout</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-2 border">Pin</th>
                        <th className="text-left p-2 border">Function</th>
                        <th className="text-left p-2 border">Wire Color</th>
                      </tr>
                    </thead>
                    <tbody>
                      {layout.pins?.map((pin, pi) => (
                        <tr key={pi} className="hover:bg-gray-50">
                          <td className="p-2 border font-mono font-bold text-blue-700">{pin.pin}</td>
                          <td className="p-2 border">{pin.function}</td>
                          <td className="p-2 border">{pin.color}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── TSB Tab ──────────────────────────────────────────────────────────────────
const TSBTab = () => {
  const { toast } = useToast();
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await dieselLaptopsAPI.getTSBs(make || undefined, model || undefined, year ? parseInt(year) : undefined);
      setResults(res.data.bulletins || []);
    } catch {
      toast({ title: 'Search failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="tsb-tab">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-500" />
            Technical Service Bulletins (TSBs)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Make</Label>
              <Select value={make} onValueChange={setMake}>
                <SelectTrigger><SelectValue placeholder="All Makes" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Makes</SelectItem>
                  {MAKES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Model (optional)</Label>
              <Input placeholder="e.g. T680, Cascadia" value={model} onChange={e => setModel(e.target.value)} />
            </div>
            <div>
              <Label>Year (optional)</Label>
              <Input placeholder="e.g. 2022" value={year} onChange={e => setYear(e.target.value)} type="number" min="2000" max="2030" />
            </div>
          </div>
          <Button
            data-testid="tsb-search-button"
            className="mt-4 bg-gradient-to-r from-red-600 to-blue-600"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
            Search Bulletins
          </Button>
        </CardContent>
      </Card>

      {results !== null && (
        <div>
          <p className="text-sm text-gray-500 mb-3">{results.length} bulletin(s) found</p>
          <div className="space-y-4">
            {results.map((tsb, idx) => (
              <Card key={idx} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <Badge className="bg-green-600 text-white mb-1">{tsb.bulletinNumber}</Badge>
                      <CardTitle className="text-base">{tsb.title}</CardTitle>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-gray-500">{tsb.date}</span>
                      <Badge variant="outline">{tsb.system}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-700">{tsb.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">Affected Components</p>
                      <div className="flex flex-wrap gap-1">
                        {tsb.affectedComponents?.map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">Affected Range</p>
                      <p className="text-xs text-gray-600">{tsb.affectedSerialRange}</p>
                    </div>
                  </div>
                  {tsb.laborTime > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Wrench className="h-4 w-4" />
                      <span>Estimated labor: <strong>{tsb.laborTime} hrs</strong></span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Maintenance Tab ──────────────────────────────────────────────────────────
const MaintenanceTab = () => {
  const { toast } = useToast();
  const [vin, setVin] = useState('');
  const [mileage, setMileage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleLookup = async () => {
    if (!vin.trim() || !mileage) {
      toast({ title: 'VIN and mileage required', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await dieselLaptopsAPI.getMaintenanceSchedule(vin.trim(), parseInt(mileage));
      setResult(res.data);
    } catch {
      toast({ title: 'Lookup failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const totalCost = result?.recommendedServices?.reduce((sum, s) => sum + (s.estimatedCost || 0), 0) ?? 0;

  return (
    <div className="space-y-6" data-testid="maintenance-tab">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-indigo-500" />
            Preventive Maintenance Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Vehicle VIN</Label>
              <Input
                data-testid="maintenance-vin-input"
                placeholder="17-character VIN"
                value={vin}
                onChange={e => setVin(e.target.value)}
                maxLength={17}
              />
            </div>
            <div>
              <Label>Current Mileage</Label>
              <Input
                data-testid="maintenance-mileage-input"
                placeholder="e.g. 350000"
                value={mileage}
                onChange={e => setMileage(e.target.value)}
                type="number"
                min="0"
              />
            </div>
          </div>
          <Button
            data-testid="maintenance-lookup-button"
            className="mt-4 bg-gradient-to-r from-red-600 to-blue-600"
            onClick={handleLookup}
            disabled={loading}
          >
            {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <ClipboardList className="h-4 w-4 mr-2" />}
            Get Maintenance Schedule
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Current Mileage</p>
                <p className="text-2xl font-bold">{result.currentMileage?.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Next Service Due</p>
                <p className="text-2xl font-bold text-orange-600">{result.nextServiceDue?.toLocaleString()}</p>
                <p className="text-xs text-gray-400">miles</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total Est. Cost</p>
                <p className="text-2xl font-bold text-green-700">${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            {result.recommendedServices?.map((svc, idx) => (
              <Card key={idx} className={svc.overdue ? 'border-red-300 bg-red-50' : ''}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold">{svc.service}</p>
                        {svc.overdue
                          ? <Badge className="bg-red-600 text-white text-xs">OVERDUE</Badge>
                          : <Badge className="bg-green-500 text-white text-xs">Due at {svc.dueMileage?.toLocaleString()} mi</Badge>}
                      </div>
                      <p className="text-sm text-gray-600">{svc.description}</p>
                      {svc.partsNeeded?.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                          <Package className="h-3 w-3" />
                          Parts: {svc.partsNeeded.map(p => p.description).join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-green-700">${svc.estimatedCost?.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">{svc.laborTime} hrs labor</p>
                      <p className="text-xs text-gray-400">Every {svc.interval?.toLocaleString()} mi</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Fleet Scanner Tab ────────────────────────────────────────────────────────
const FleetScannerTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = async () => {
    setLoading(true);
    toast({ title: 'Fleet Scan Started', description: 'Scanning all vehicles for active fault codes...' });
    try {
      const res = await dieselLaptopsAPI.fleetScan();
      setResult(res.data);
      toast({ title: 'Fleet Scan Complete', description: `Scanned ${res.data.totalVehicles} vehicles` });
    } catch {
      toast({ title: 'Fleet scan failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const StatusIcon = ({ status }) => {
    if (status === 'critical') return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (status === 'warning') return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  return (
    <div className="space-y-6" data-testid="fleet-scanner-tab">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-500" />
            Fleet-Wide Diagnostic Scanner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">Scan all registered fleet vehicles for active fault codes and diagnostic trouble codes simultaneously.</p>
          <Button
            data-testid="fleet-scan-button"
            size="lg"
            className="bg-gradient-to-r from-red-600 to-blue-600"
            onClick={handleScan}
            disabled={loading}
          >
            {loading ? <RefreshCw className="h-5 w-5 mr-2 animate-spin" /> : <Scan className="h-5 w-5 mr-2" />}
            {loading ? 'Scanning Fleet...' : 'Start Fleet Scan'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Vehicles', value: result.totalVehicles, color: 'text-gray-900' },
              { label: 'Critical', value: result.criticalCount, color: 'text-red-600' },
              { label: 'Warnings', value: result.warningCount, color: 'text-yellow-600' },
              { label: 'All Clear', value: result.okCount, color: 'text-green-600' },
            ].map(stat => (
              <Card key={stat.label}>
                <CardContent className="pt-4 text-center">
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-3">
            {result.vehicles?.map((vehicle, idx) => (
              <Card key={idx} className={
                vehicle.status === 'critical' ? 'border-red-300' :
                vehicle.status === 'warning' ? 'border-yellow-300' : ''
              }>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <StatusIcon status={vehicle.status} />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold">{vehicle.unitNumber}</span>
                          <span className="text-gray-500 text-sm">{vehicle.year} {vehicle.make} {vehicle.model}</span>
                          <Badge variant="outline" className="text-xs font-mono">{vehicle.vin}</Badge>
                        </div>
                        <p className="text-xs text-gray-400">{vehicle.mileage?.toLocaleString()} miles</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {vehicle.activeDTCs?.length === 0
                        ? <Badge className="bg-green-500 text-white">No Active Codes</Badge>
                        : vehicle.activeDTCs?.map((dtc, di) => (
                            <div key={di} className="flex flex-col items-end">
                              <Badge className={dtc.severity === 'critical' ? 'bg-red-600 text-white' : dtc.severity === 'high' ? 'bg-orange-500 text-white' : 'bg-yellow-500 text-white'}>
                                {dtc.code}
                              </Badge>
                              <span className="text-xs text-gray-500 mt-0.5">{dtc.description}</span>
                            </div>
                          ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const DieselLaptops = () => {
  const [activeTab, setActiveTab] = useState('dtc');

  return (
    <div className="p-6 space-y-6" data-testid="diesel-laptops-page">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-red-600 to-orange-500 rounded-xl">
          <Cpu className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Diesel Laptops</h1>
          <p className="text-gray-600 mt-0.5">Professional truck diagnostic & repair information system</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b pb-0">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              data-testid={`diesel-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'dtc' && <DTCTab />}
        {activeTab === 'parts' && <PartsTab />}
        {activeTab === 'wiring' && <WiringTab />}
        {activeTab === 'tsb' && <TSBTab />}
        {activeTab === 'maintenance' && <MaintenanceTab />}
        {activeTab === 'fleet' && <FleetScannerTab />}
      </div>
    </div>
  );
};

export default DieselLaptops;
