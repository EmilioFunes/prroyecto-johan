using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using back.shoesshop.Data;
using back.shoesshop.Models;

namespace back.shoesshop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class ShoesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ShoesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Shoe>>> GetShoes()
        {
            return await _context.Shoes.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Shoe>> GetShoe(int id)
        {
            var shoe = await _context.Shoes.FindAsync(id);
            if (shoe == null) return NotFound();
            return shoe;
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<Shoe>> PostShoe(Shoe shoe)
        {
            _context.Shoes.Add(shoe);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetShoe), new { id = shoe.Id }, shoe);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutShoe(int id, Shoe shoe)
        {
            if (id != shoe.Id) return BadRequest();
            _context.Entry(shoe).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Shoes.Any(e => e.Id == id)) return NotFound();
                throw;
            }
            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteShoe(int id)
        {
            var shoe = await _context.Shoes.FindAsync(id);
            if (shoe == null) return NotFound();
            _context.Shoes.Remove(shoe);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
