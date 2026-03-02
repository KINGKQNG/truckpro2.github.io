import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { CreditCard, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { paymentsAPI } from '../services/api';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const loadPayments = async () => {
    try {
      const response = await paymentsAPI.getAll();
      setPayments(response.data || []);
    } catch (error) {
      toast({
        title: 'Load failed',
        description: 'Unable to load payments',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleProcessPayment = async (paymentId, method) => {
    setIsProcessing(true);

    try {
      await paymentsAPI.process(paymentId, method);
      await loadPayments();
      toast({
        title: "Payment Processed",
        description: `Payment successfully processed via ${method.replace('_', ' ')}`,
      });
      setSelectedPayment(null);
    } catch (error) {
      toast({
        title: 'Processing failed',
        description: 'Unable to process payment',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const paidPayments = payments.filter(p => p.status === 'paid');
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-6 space-y-6" data-testid="payments-page">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payment Processing</h1>
        <p className="text-gray-600 mt-1">Manage customer payments and invoices</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">${totalPending.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">{pendingPayments.length} invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Paid Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">{paidPayments.length} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalPending + totalPaid).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingPayments.length > 0 ? (
              pendingPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-amber-50 border-l-4 border-l-amber-500">
                  <div className="flex-1">
                    <h3 className="font-semibold">{payment.workOrderNumber}</h3>
                    <p className="text-sm text-gray-600">{payment.customerName}</p>
                    <p className="text-xs text-gray-500">Due: {new Date(payment.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">${payment.amount.toLocaleString()}</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          data-testid={`payment-process-button-${payment.id}`}
                          size="sm" 
                          className="mt-2 bg-gradient-to-r from-red-600 to-blue-600"
                          onClick={() => setSelectedPayment(payment)}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Process Payment
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Process Payment - {payment.workOrderNumber}</DialogTitle>
                          <DialogDescription data-testid="payment-dialog-description">Select a payment method to complete this invoice.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Customer</Label>
                            <p className="font-medium">{payment.customerName}</p>
                          </div>
                          <div className="space-y-2">
                            <Label>Amount Due</Label>
                            <p className="text-2xl font-bold text-blue-600">${payment.amount.toLocaleString()}</p>
                          </div>
                          <div className="space-y-2">
                            <Label>Payment Method</Label>
                            <div className="grid grid-cols-2 gap-3">
                              <Button
                                data-testid="payment-method-credit-card-button"
                                variant="outline" 
                                className="h-20"
                                disabled={isProcessing}
                                onClick={() => handleProcessPayment(payment.id, 'credit_card')}
                              >
                                <div className="text-center">
                                  <CreditCard className="h-6 w-6 mx-auto mb-1" />
                                  <p className="text-xs">Credit Card</p>
                                </div>
                              </Button>
                              <Button
                                data-testid="payment-method-cash-button"
                                variant="outline" 
                                className="h-20"
                                disabled={isProcessing}
                                onClick={() => handleProcessPayment(payment.id, 'cash')}
                              >
                                <div className="text-center">
                                  <DollarSign className="h-6 w-6 mx-auto mb-1" />
                                  <p className="text-xs">Cash</p>
                                </div>
                              </Button>
                              <Button
                                data-testid="payment-method-check-button"
                                variant="outline" 
                                className="h-20"
                                disabled={isProcessing}
                                onClick={() => handleProcessPayment(payment.id, 'check')}
                              >
                                <div className="text-center">
                                  <CheckCircle className="h-6 w-6 mx-auto mb-1" />
                                  <p className="text-xs">Check</p>
                                </div>
                              </Button>
                              <Button
                                data-testid="payment-method-fleet-account-button"
                                variant="outline" 
                                className="h-20"
                                disabled={isProcessing}
                                onClick={() => handleProcessPayment(payment.id, 'fleet_account')}
                              >
                                <div className="text-center">
                                  <CreditCard className="h-6 w-6 mx-auto mb-1" />
                                  <p className="text-xs">Fleet Account</p>
                                </div>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No pending payments</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paidPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-l-4 border-l-green-500">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{payment.workOrderNumber}</h3>
                    <Badge className="bg-green-500 text-white">Paid</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{payment.customerName}</p>
                  <p className="text-xs text-gray-500">Paid: {new Date(payment.paidDate).toLocaleDateString()} via {payment.method?.replace('_', ' ')}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600">${payment.amount.toLocaleString()}</p>
                  <CheckCircle className="h-5 w-5 text-green-600 ml-auto mt-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payments;
