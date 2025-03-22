import { Transaction } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPrice } from "@/lib/utils";
import { TRANSACTION_TYPES } from "@/lib/constants";

interface TransactionsTableProps {
  transactions: Transaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Coin</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Value (USD)</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-4">
              No transactions found
            </TableCell>
          </TableRow>
        ) : (
          transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.id}</TableCell>
              <TableCell>{transaction.userId}</TableCell>
              <TableCell>
                <Badge variant={
                  transaction.type === TRANSACTION_TYPES.BUY ? "default" :
                  transaction.type === TRANSACTION_TYPES.SELL ? "destructive" :
                  transaction.type === TRANSACTION_TYPES.DEPOSIT ? "outline" : 
                  "outline"
                }>
                  {transaction.type}
                </Badge>
              </TableCell>
              <TableCell className="uppercase">{transaction.coinId}</TableCell>
              <TableCell>{transaction.amount.toFixed(6)}</TableCell>
              <TableCell>{formatPrice(transaction.price * transaction.amount)}</TableCell>
              <TableCell>{formatDate(transaction.timestamp)}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}