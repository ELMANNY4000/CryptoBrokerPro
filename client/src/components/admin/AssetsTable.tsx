import { PortfolioAsset } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";
import CoinIcon from "@/components/ui/CoinIcon";

interface AssetsTableProps {
  assets: PortfolioAsset[];
}

export function AssetsTable({ assets }: AssetsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Coin</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Average Buy Price</TableHead>
          <TableHead>Total Value (USD)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assets.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-4">
              No assets found
            </TableCell>
          </TableRow>
        ) : (
          assets.map((asset) => (
            <TableRow key={`${asset.userId}-${asset.coinId}`}>
              <TableCell>{asset.userId}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <CoinIcon symbol={asset.symbol} size="sm" />
                  <span className="uppercase">{asset.symbol}</span>
                </div>
              </TableCell>
              <TableCell>{asset.amount.toFixed(6)}</TableCell>
              <TableCell>{formatPrice(asset.avgBuyPrice)}</TableCell>
              <TableCell>{formatPrice(asset.amount * asset.avgBuyPrice)}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}